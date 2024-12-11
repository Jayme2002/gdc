import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import rawBody from 'raw-body';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Initialize Stripe with secret key from env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20'
});

const app = express();
const port = process.env.PORT || 3000;
const upload = multer();

// Define proper interfaces
interface StripeWebhookRequest extends Omit<Request, 'body'> {
    body: Buffer;
    rawBody?: Buffer;
}

interface CheckoutRequest extends Request {
    body: {
        userId: string;
    };
}

interface ImageAnalysisRequest extends Request {
    file?: Express.Multer.File;
}

// Type the handlers properly
const handleWebhook: RequestHandler = async (
    req: Request & StripeWebhookRequest, 
    res: Response
): Promise<void> => {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!endpointSecret) {
        res.status(400).send('Webhook secret not configured');
        return;
    }

    try {
        const sig = req.headers['stripe-signature'];
        const payload = await rawBody(req);

        if (!sig || !payload) {
            res.status(400).send('Missing signature or payload');
            return;
        }

        const event = stripe.webhooks.constructEvent(payload.toString(), sig, endpointSecret);

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.client_reference_id;

                if (userId) {
                    const userRef = doc(db, 'users', userId);
                    await updateDoc(userRef, {
                        isUpgraded: true,
                        subscriptionStatus: 'active',
                        subscriptionDate: new Date().toISOString(),
                        subscriptionId: session.subscription
                    });
                }
                break;
        }

        res.json({ received: true });
    } catch (err: unknown) {
        console.error('Webhook Error:', err);
        res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
};

const handleImageAnalysis: RequestHandler = async (
    req: Request & ImageAnalysisRequest, 
    res: Response
): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No image provided' });
            return;
        }

        // Convert image to base64
        const base64Image = req.file.buffer.toString('base64');

        // Call OpenAI with the image
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are analyzing multiple choice questions. Only respond with the letters necessary to answer the question. Some Questions might have one correct answer while others might have multiple. Analyze the image and determine which A,B,C,D,E is correct ."
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${req.file.mimetype};base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 8
        });

        // Add proper null checking
        const answer = response.choices[0]?.message?.content;
        if (!answer) {
            res.status(500).json({ error: 'No answer received from OpenAI' });
            return;
        }

        res.json({ answer: answer.trim() });
    } catch (err) {
        console.error('Image Analysis Error:', err);
        res.status(500).json({ error: 'Image analysis failed' });
    }
};

// Use the handlers in routes
app.post(
    '/webhook', 
    express.raw({type: 'application/json'}), 
    handleWebhook
);

app.post(
    '/api/analyze-image', 
    upload.single('image'), 
    handleImageAnalysis
);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Add this endpoint to your server
app.post('/create-checkout-session', async (req: CheckoutRequest, res: Response) => {
    try {
        const { userId } = req.body;
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            client_reference_id: userId,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Premium Subscription',
                            description: 'Access to premium features',
                        },
                        unit_amount: 999, // $9.99 in cents
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${req.protocol}://${req.get('host')}/success.html`,
            cancel_url: `${req.protocol}://${req.get('host')}/main.html`,
        });

        res.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe error:', error);
        res.status(500).json({ error: error.message });
    }
});

// For all other routes, serve the index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Instead, export your app
export default app;

// Add this if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}