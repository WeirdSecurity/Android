import { config } from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load .env file
config({ path: './.env' });

async function runTest() {
  console.log('🚀 Starting Gemini Model Discovery...');
  console.log('------------------------------------');
  
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!key || key === 'YOUR_GEMINI_API_KEY_HERE') {
    console.error('❌ Error: EXPO_PUBLIC_GEMINI_API_KEY is missing');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(key);

  try {
    console.log('📋 Fetching available models...');
    // listModels is only available in some versions of the SDK or via specific calls
    // For now, let's just try a few common names
    const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    
    for (const modelName of modelsToTry) {
      try {
        console.log('🧠 Sending test prompt (v1 Stable)...');
        const response_raw = await fetch(`https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'Hello! Please respond with "Gemini is online and ready to teach!"' }] }] })
        });
        const data = await response_raw.json();
        if (data.error) throw new Error(data.error.message);
        const response = data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log(`✅ ${modelName} is working!`);
        console.log(`   Response: ${response.substring(0, 30)}...`);
        break; 
      } catch (err: any) {
        console.log(`❌ ${modelName} failed: ${err.message}`);
      }
    }

  } catch (err: any) {
    console.error('❌ Fatal error:', err.message);
  }
}

runTest();
