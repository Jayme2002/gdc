import { buffer } from 'micro';
import { doc, updateDoc } from 'firebase/firestore';
import { WebhookRequest, WebhookResponse } from './types';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import Stripe from 'stripe';
import { IncomingMessage } from 'http';

const firebaseConfig = {
    apiKey: "AIzaSyBr4NT9Dp2UrvTvoaeBr02HkFe-t9IYsPo",
    authDomain: "gdclone-8fc16.firebaseapp.com",
    projectId: "gdclone-8fc16",
    storageBucket: "gdclone-8fc16.firebasestorage.app",
    messagingSenderId: "944013008902",
    appId: "1:944013008902:web:66d378e0e125897a0e6387",
    measurementId: "G-523K7DY9SW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20'
});

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(
    req: IncomingMessage & WebhookRequest,
    res: WebhookResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!endpointSecret) {
        return res.status(400).send('Webhook secret not configured');
    }

    try {
        const rawBody = await buffer(req);
        const sig = req.headers['stripe-signature'];

        const event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                if (session.client_reference_id) {
                    const userRef = doc(db, 'users', session.client_reference_id);
                    await updateDoc(userRef, {
                        isUpgraded: true,
                        subscriptionStatus: 'active',
                        subscriptionDate: new Date().toISOString(),
                        subscriptionId: session.subscription
                    });
                }
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } catch (err: unknown) {
        console.error('Webhook error:', err);
        res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
}