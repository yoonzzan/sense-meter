import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
    console.error('API Key not found in .env.local');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // Note: The SDK doesn't have a direct listModels method on the client instance in all versions,
        // but we can try to use the model to generate content to test, or use the API directly if needed.
        // Actually, the SDK *does* have a way to get model info, but it might be via the genAI.getGenerativeModel().
        // Wait, for listing models, we might need to use the REST API if the SDK doesn't expose it easily.
        // Let's try a simple generation with 'gemini-1.5-flash' first to see if it works locally.
        // If it works locally, then it's a Vercel issue.

        console.log('Testing gemini-1.5-flash...');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log('gemini-1.5-flash works! Response:', result.response.text());

    } catch (error) {
        console.error('Error with gemini-1.5-flash:', error.message);
    }

    try {
        console.log('Testing gemini-pro...');
        const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
        const resultPro = await modelPro.generateContent("Hello");
        console.log('gemini-pro works! Response:', resultPro.response.text());
    } catch (error) {
        console.error('Error with gemini-pro:', error.message);
    }
}

listModels();
