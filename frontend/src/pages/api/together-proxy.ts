// /pages/api/together-proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next'

const BASE_URL = 'https://api.together.xyz/v1/chat/completions'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  const { model, messages, temperature = 0.4, max_tokens = 4096, top_p = 0.9 } = req.body

  if (!model || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Campos "model" e "messages[]" são obrigatórios.' })
  }

  if (!process.env.TOGETHER_API_KEY) {
    return res.status(500).json({ error: 'TOGETHER_API_KEY não definida no ambiente.' })
  }

  try {
    const togetherResponse = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        top_p,
      }),
    })

    if (!togetherResponse.ok) {
      const errorText = await togetherResponse.text()
      console.error('[Together API] Erro HTTP:', togetherResponse.status, errorText)
      return res.status(togetherResponse.status).json({ error: errorText })
    }

    const result = await togetherResponse.json()
    return res.status(200).json(result)
  } catch (error: any) {
    console.error('[Together Proxy] Erro interno:', error)
    return res.status(500).json({
      error: 'Erro interno ao chamar a Together AI',
      details: error.message,
    })
  }
}
