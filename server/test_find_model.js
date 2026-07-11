import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const apiKey = process.env.NVIDIA_API_KEY;
  try {
    const modelsRes = await fetch('https://integrate.api.nvidia.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const modelsData = await modelsRes.json();
    if (!modelsData.data || !Array.isArray(modelsData.data)) {
      console.log('No models returned in response:', modelsData);
      return;
    }

    const testModels = modelsData.data
      .map(m => m.id)
      .filter(id => id.includes('llama') && (id.includes('instruct') || id.includes('chat')));

    console.log(`Found ${testModels.length} candidate models to test. testing...`);

    for (const model of testModels) {
      console.log(`Testing model: ${model} ...`);
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
      console.log(`  -> Status: ${res.status}`);
      if (res.status === 200) {
        const text = await res.text();
        console.log(`🎉 SUCCESS WITH MODEL: ${model}`);
        console.log(`Response snippet: ${text}`);
        break;
      }
    }
  } catch (err) {
    console.error('Error running test:', err.message);
  }
}
run();
