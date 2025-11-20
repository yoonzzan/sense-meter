import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
    console.error('❌ API Key not found in .env.local');
    console.error('Please update .env.local with your valid API Key.');
    process.exit(1);
}

async function checkModels() {
    console.log(`🔑 Checking models with API Key: ${apiKey.substring(0, 5)}...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("❌ Error listing models:", JSON.stringify(data.error, null, 2));
        } else if (data.models) {
            console.log("✅ Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
                }
            });
        } else {
            console.log("❓ Unexpected response:", data);
        }
    } catch (e) {
        console.error("❌ Fetch error:", e);
    }
}

checkModels();
