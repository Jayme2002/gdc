import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Debug logging
console.log('Current directory:', __dirname);
console.log('ENV File Path:', path.resolve(__dirname, '../../.env'));
console.log('API Key exists:', !!process.env.OPENAI_API_KEY);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '' // Provide a default empty string to prevent undefined
});

export async function generateResponse(content: string) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured');
    }

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content }],
            model: "gpt-4o",
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Error calling OpenAI:', error);
        throw error;
    }
}
