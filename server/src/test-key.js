
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testKey() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: "hi" }],
      max_tokens: 5
    });
    console.log('✅ OpenAI API Key is valid.');
  } catch (error) {
    console.error('❌ OpenAI API Key Error:');
    console.error(error.message);
  }
}

testKey();
