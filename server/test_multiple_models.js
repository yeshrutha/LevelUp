import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const apiKey = process.env.NVIDIA_API_KEY;
  const models = [
    'meta/llama-3.3-70b-instruct',
    'meta/llama-3.1-70b-instruct',
    'nvidia/llama-3.1-nemotron-51b-instruct',
    'nvidia/nvidia-nemotron-nano-9b-v2',
    'abacusai/dracarys-llama-3.1-70b-instruct'
  ];
  for (const model of models) {
    try {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5
        })
      });
      console.log(`Model: ${model} -> Status: ${res.status}`);
    } catch (err) {
      console.log(`Model: ${model} -> Error: ${err.message}`);
    }
  }
}
run();
