import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import multer from 'multer';
import { Buffer } from 'buffer';

// Add interface for the multer-augmented request
interface MulterRequest extends VercelRequest {
    file?: Express.Multer.File;
}

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

export default async function handler(req: MulterRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await runMiddleware(req, res, upload.single('image'));
        
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        const base64Image = req.file.buffer.toString('base64');

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "Format your response using HTML tags for better readability. Use <p> for paragraphs, <h1>, <h2>, <h3> for headings, <ul> and <li> for lists, and <strong> or <em> for emphasis where appropriate."
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
            max_tokens: 1000
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