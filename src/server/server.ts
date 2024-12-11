import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Initialize Stripe with secret key from env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16'
});

const app = express();
const port = process.env.PORT || 3000;
const upload = multer();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Add this new endpoint for image analysis
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
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
            return res.status(500).json({ error: 'No answer received from OpenAI' });
        }

        res.json({ answer: answer.trim() });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to analyze image' });
    }
});

// Add this endpoint to your server
app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
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