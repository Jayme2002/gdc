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
        
        // Get the customer ID from Stripe using the Firebase user ID
        const customerList = await stripe.customers.search({
            query: `metadata['firebaseUID']:'${userId}'`,
            limit: 1
        });

        if (!customerList.data.length) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: customerList.data[0].id,
            return_url: `${req.headers.origin}/main.html`,
        });

        res.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe error:', error);
        res.status(500).json({ error: error.message });
    }
}