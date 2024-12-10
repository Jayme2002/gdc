import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
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

// For all other routes, serve the index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});