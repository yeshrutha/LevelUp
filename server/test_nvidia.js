import dotenv from 'dotenv';
dotenv.config();

const testNvidia = async () => {
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  if (!nvidiaKey) {
    console.error("NVIDIA_API_KEY is not defined in environment.");
    return;
  }

  const url = 'https://integrate.api.nvidia.com/v1/chat/completions';
  const targetModel = 'meta/llama-3.3-70b-instruct';

  console.log("Sending request to NVIDIA completions URL:", url);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${nvidiaKey}`
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say hello in 5 words.' }
        ]
      })
    });

    console.log("Response Status:", response.status, response.statusText);
    const text = await response.text();
    console.log("Response Body:", text);
  } catch (err) {
    console.error("Fetch Exception:", err);
  }
};

testNvidia();
