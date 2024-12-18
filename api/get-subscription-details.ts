import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20'
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId } = req.body;
        
        const customers = await stripe.customers.search({
            query: `metadata['firebaseUID']:'${userId}'`,
            limit: 1
        });

        if (!customers.data.length) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const subscriptions = await stripe.subscriptions.list({
            customer: customers.data[0].id,
            limit: 1,
            status: 'active'
        });

        if (!subscriptions.data.length) {
            return res.status(404).json({ error: 'No active subscription found' });
        }

        res.json({ subscription: subscriptions.data[0] });
    } catch (error: any) {
        console.error('Stripe error:', error);
        res.status(500).json({ error: error.message });
    }
}