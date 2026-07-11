import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const apiKey = process.env.NVIDIA_API_KEY;
  try {
    const res = await fetch('https://integrate.api.nvidia.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    const data = await res.json();
    console.log('API Models Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error fetching models:', err.message);
  }
}
run();
