type IAProvider = 'gpt-3.5' | 'gpt-turbo';

export async function callOpenAI(input: string, model: IAProvider): Promise<string> {
  const openAIModel = model === 'gpt-3.5' ? 'gpt-3.5-turbo' : 'gpt-4-turbo';

  const outputTokenLimits = {
    'gpt-3.5': 1000,
    'gpt-turbo': 2000
  };

  const max_tokens = outputTokenLimits[model];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: openAIModel,
      messages: [{ role: 'user', content: input }],
      max_tokens
    })
  });

  if (!response.ok) {
    throw new Error('OpenAI API error: ' + response.statusText);
  }

  const data = await response.json();

  return data.choices[0].message.content;
}
