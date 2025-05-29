type ModelType = 'auto' | 'scout' | 'maverickturbo-free' | 'bert' | 'cnn' | 'llama'

interface EzraOptions {
  prompt: string
  model?: ModelType // default = 'auto'
}

export async function callEzraUniversal({ prompt, model = 'auto' }: EzraOptions): Promise<string> {
  const systemPrompt = `
Você é Ezra, um assistente executivo com inteligência comparável ao GPT-4. Atue com precisão jurídica, técnica e estratégica.
Responda sempre com linguagem formal, em português, estruturada e segura.
  `.trim()

  const lowerPrompt = prompt.toLowerCase()

  // Ativação por palavras-chave ou seleção direta
  const shouldUseScout = model === 'scout' || (model === 'auto' && lowerPrompt.includes('analise'))
  const shouldUseBert  = model === 'bert'  || (model === 'auto' && lowerPrompt.includes('classifique'))
  const shouldUseCnn   = model === 'cnn'   || (model === 'auto' && lowerPrompt.includes('olhe'))
  const isLongReport   = lowerPrompt.includes('relatório') || lowerPrompt.includes('relatorio')

  // 🧠 Escolha do modelo com fallback automático
  let selectedModel: string
  let fallbackModel: string | null = null

  if (shouldUseScout) {
    selectedModel = 'meta-llama/Llama-4-Scout-17B-16E-Instruct-FP8'
  } else if (shouldUseBert) {
    selectedModel = 'togethercomputer/m2-bert-80M-32k-retrieval'
  } else if (shouldUseCnn) {
    selectedModel = 'black-forest-labs/FLUX.1-Canny-dev'
  } else {
    selectedModel = 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free'
    fallbackModel = 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8'
  }

  const approxPromptTokens = Math.ceil((prompt.length + systemPrompt.length) / 4)
  const maxModelTokens = 8192
  const targetResponseTokens = isLongReport ? 6000 : 1500
  const availableTokens = Math.max(512, Math.min(targetResponseTokens, maxModelTokens - approxPromptTokens))

  async function tryFetch(modelToUse: string): Promise<string> {
    const response = await fetch('/api/together-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        max_tokens: availableTokens,
        top_p: 0.9
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Together API] Erro HTTP (${modelToUse}):`, errorText)
      throw new Error('Erro na requisição')
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content ?? '[⚠️ Resposta vazia]'
  }

  try {
    return await tryFetch(selectedModel)
  } catch (error: any) {
    console.error(`[Ezra LLM] Erro no modelo ${selectedModel}:`, error.message)

    if (fallbackModel) {
      try {
        console.warn(`[Ezra LLM] Tentando fallback: ${fallbackModel}`)
        return await tryFetch(fallbackModel)
      } catch (fallbackError: any) {
        console.error(`[Ezra LLM] Fallback também falhou (${fallbackModel}):`, fallbackError.message)
      }
    }

    return '[❌ Falha ao processar resposta com Ezra]'
  }
}