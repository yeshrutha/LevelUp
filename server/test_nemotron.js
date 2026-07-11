import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const apiKey = process.env.NVIDIA_API_KEY;
  try {
    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'nvidia/llama-3.1-nemotron-70b-instruct',
        messages: [
          { role: 'system', content: 'You are a helper.' },
          { role: 'user', content: 'Hello' }
        ]
      })
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
run();
