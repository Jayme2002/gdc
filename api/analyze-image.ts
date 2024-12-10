import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import multer from 'multer';
import { Buffer } from 'buffer';

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

const runMiddleware = (req: VercelRequest, res: VercelResponse, fn: any) => {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
};

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await runMiddleware(req, res, upload.single('image'));
        
        // @ts-ignore - req.file is added by multer
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // @ts-ignore - req.file is added by multer
        const base64Image = req.file.buffer.toString('base64');

        const response = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: "system",
                    content: "You are analyzing multiple choice questions. Only respond with the letters necessary to answer the question. Some Questions might have one correct answer while others might have multiple. Analyze the image and determine which A,B,C,D,E is correct."
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "image_url",
                            image_url: {
                                // @ts-ignore - req.file is added by multer
                                url: `data:${req.file.mimetype};base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 8
        });

        const answer = response.choices[0]?.message?.content;
        if (!answer) {
            return res.status(500).json({ error: 'No answer received from OpenAI' });
        }

        res.json({ answer: answer.trim() });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to analyze image' });
    }
}