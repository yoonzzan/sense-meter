import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key is not configured on the server.' });
    }

    try {
        const { situation, sensation } = req.body;

        if (!situation || !sensation) {
            return res.status(400).json({ error: 'Situation and sensation are required.' });
        }

        const schema: Schema = {
            type: SchemaType.OBJECT,
            properties: {
                tags: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING },
                    description: 'Recommended emotion tags (hashtags)'
                }
            },
            required: ['tags']
        };

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const prompt = `
      Analyze the following user experience and recommend 5 witty, empathetic, and trend-savvy hashtags (emotion tags).
      The tags should capture the core emotion or the essence of the situation.
      
      User's Situation: "${situation}"
      User's Sensation: "${sensation}"
      
      Requirements:
      - Tags must start with '#'.
      - Mix of direct emotion words (e.g., #Sad) and witty internet slang (e.g., #KingGodGeneral).
      - Korean language only.
      - Maximum 5 tags.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();
        const jsonResponse = JSON.parse(textResponse);

        return res.status(200).json(jsonResponse);

    } catch (error: any) {
        console.error('Error in recommend-tags API:', error);
        return res.status(500).json({ error: 'Failed to generate tags', details: error.message });
    }
}
