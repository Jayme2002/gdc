import { Request } from 'express';
import { Stripe } from 'stripe';

export interface WebhookRequest extends Request {
    body: string | Buffer;
    headers: {
        'stripe-signature': string;
        [key: string]: string | string[] | undefined;
    };
}

export interface WebhookResponse {
    status: (code: number) => WebhookResponse;
    send: (body: string) => void;
    json: (body: { received: boolean }) => void;
}