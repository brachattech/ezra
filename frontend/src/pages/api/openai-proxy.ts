// src/pages/api/ezra-proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST.' })
  }

  const { model, messages, temperature = 0.4, max_tokens = 4096, top_p = 0.9 } = req.body

  if (!model || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Campos "model" e "messages[]" são obrigatórios.' })
  }

  const isOpenAI = model.startsWith('openai/')
  const baseUrl = isOpenAI
    ? 'https://api.openai.com/v1/chat/completions'
    : 'https://api.together.xyz/v1/chat/completions'

  const apiKey = isOpenAI
    ? process.env.OPENAI_API_KEY
    : process.env.TOGETHER_API_KEY

  if (!apiKey) {
    return res.status(500).json({
      error: `Chave ${isOpenAI ? 'OPENAI_API_KEY' : 'TOGETHER_API_KEY'} não definida.`,
    })
  }

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: isOpenAI ? model.replace('openai/', '') : model,
        messages,
        temperature,
        max_tokens,
        top_p,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error(`[${isOpenAI ? 'OpenAI' : 'Together'} API] Erro HTTP:`, response.status, result)
      return res.status(response.status).json({ error: result })
    }

    return res.status(200).json(result)
  } catch (err: any) {
    console.error(`[Ezra Proxy] Erro interno com ${isOpenAI ? 'OpenAI' : 'Together'}:`, err)
    return res.status(500).json({
      error: `Erro interno com ${isOpenAI ? 'OpenAI' : 'Together'}`,
      details: err.message,
    })
  }
}
