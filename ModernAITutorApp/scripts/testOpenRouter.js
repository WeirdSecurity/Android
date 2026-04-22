const key = "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";
const models = [
    'google/gemma-3-27b-it:free',
    'nousresearch/hermes-3-llama-3.1-405b:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'qwen/qwen3-coder:free'
];

async function testAll() {
  for (const model of models) {
    console.log(`Testing ${model}...`);
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "hello" }]
        })
      });
      console.log(`Status: ${res.status}`);
      const text = await res.text();
      console.log(text.substring(0, 150));
    } catch(e) {
      console.error(e.message);
    }
  }
}
testAll();
