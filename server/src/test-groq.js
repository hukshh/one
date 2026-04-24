
const OpenAI = require('openai');
require('dotenv').config();

// Test Groq using the OpenAI SDK
const client = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

async function testGroq() {
  console.log('🧪 Testing Groq with model: llama-3.3-70b-versatile');
  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "hi" }],
      max_tokens: 5
    });
    console.log('✅ Groq API Key is valid and working!');
    console.log('Response:', response.choices[0].message.content);
  } catch (error) {
    console.error('❌ Groq API Error:');
    console.error(error.message);
  }
}

testGroq();
