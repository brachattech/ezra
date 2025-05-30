type ModelType = 'auto' | 'scout' | 'bert' | 'cnn' | 'llama' | 'gpt4turbo' | 'qwen-coder'

interface EzraOptions {
  prompt: string
  model?: ModelType // default = 'auto'
}

export async function callEzraUniversal({ prompt, model = 'auto' }: EzraOptions): Promise<string> {
  const systemPrompt = `
Você é Ezra, um assistente executivo com inteligência comparável ao GPT-4.

Sua função é gerar documentos formais com excelência técnica e padrão internacional. Utilize sempre o português formal, organizado, direto e preciso, sem símbolos ou hashtags.

1. Relatório Jurídico:
- Comece com uma introdução explicando o objetivo do relatório.
- Apresente a fundamentação legal com leis nacionais e internacionais relevantes.
- Analise cláusulas, situações ou fatos com embasamento técnico.
- Aponte riscos jurídicos, possíveis sanções e impactos.
- Finalize com uma conclusão e recomendações jurídicas concretas.

2. Relatório Pedagógico:
- Estruture com: Introdução, Indicadores observados, Avaliações realizadas, Recomendações e Prognóstico.
- Descreva claramente as dificuldades do aluno, sem juízo de valor.
- Use termos técnicos da área educacional e pedagógica.

3. Análise Contratual:
- Inicie com o escopo da análise.
- Detalhe cláusulas críticas, riscos, obrigações e inconsistências.
- Apresente parecer técnico claro, separado por tópicos.
- Finalize com conclusões e recomendações jurídicas.

Nunca use hashtags. Nunca insira linguagem informal. Nunca misture áreas. Organize os textos com títulos e subtítulos claros. O foco é sempre entregar um documento técnico, internacionalmente padronizado.
  `.trim()

  function normalize(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s]/gi, '')
      .toLowerCase()
  }

  const normalizedPrompt = normalize(prompt)

  const shouldUseGPT4 = model === 'deepseek-ai/DeepSeek-R1' || (
    model === 'auto' &&
    (
      normalizedPrompt.includes('faca um relatorio juridico') ||
      normalizedPrompt.includes('faca um relatorio pedagogico') ||
      normalizedPrompt.includes('faca uma analise juridica')
    )
  )

  const shouldUseBert = model === 'bert' || (
    model === 'auto' && normalizedPrompt.includes('classifique')
  )

  const shouldUseCnn = model === 'cnn' || (
    model === 'auto' && normalizedPrompt.includes('olhe')
  )

  const shouldUseQwenCoder = model === 'qwen-coder' || (
    model === 'auto' &&
    (
      normalizedPrompt.includes('vamos codar') ||
      normalizedPrompt.includes('gere o codigo') ||
      normalizedPrompt.includes('refatore') ||
      normalizedPrompt.includes('typescript') ||
      normalizedPrompt.includes('python') ||
      normalizedPrompt.includes('next') ||
      normalizedPrompt.includes('react') ||
      normalizedPrompt.includes('fastapi')
    )
  )

  let selectedModel: string
  let fallbackModel: string | null = null

  if (shouldUseGPT4) {
    selectedModel = 'deepseek-ai/DeepSeek-R1'
  } else if (shouldUseBert) {
    selectedModel = 'togethercomputer/m2-bert-80M-32k-retrieval'
  } else if (shouldUseCnn) {
    selectedModel = 'black-forest-labs/FLUX1.1-pro'
  } else if (shouldUseQwenCoder) {
    selectedModel = 'Qwen/Qwen2.5-Coder-32B-Instruct'
    fallbackModel = 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'
  } else {
    selectedModel = 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo'
    fallbackModel = 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'
  }

  const approxPromptTokens = Math.ceil((prompt.length + systemPrompt.length) / 4)
  const maxModelTokens = 8192
  const targetResponseTokens = normalizedPrompt.includes('relatorio') ? 6000 : 1500

  let availableTokens: number
  if (selectedModel.includes('bert')) {
    availableTokens = 20
  } else if (selectedModel.includes('FLUX') || selectedModel.includes('flux')) {
    availableTokens = 1
  } else {
    availableTokens = Math.max(512, Math.min(targetResponseTokens, maxModelTokens - approxPromptTokens))
  }

  async function tryFetch(modelToUse: string): Promise<string> {
    if (modelToUse.includes('FLUX') || modelToUse.includes('flux')) {
      return '[🖼️ Modelo de imagem ativado. A resposta visual será tratada separadamente.]'
    }

    const isOpenAI = modelToUse.startsWith('openai:') || modelToUse === 'gpt-4-turbo'
const proxyEndpoint = isOpenAI ? '/api/openai-proxy' : '/api/together-proxy'
const modelName = isOpenAI ? modelToUse.replace('openai:', '') : modelToUse


    const response = await fetch(proxyEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelName,
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
      console.error(`[Ezra Proxy] Erro HTTP (${modelName}):`, errorText)
      throw new Error('Erro na requisição')
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content ?? '[⚠️ Resposta vazia]'
  }

  try {
    const resposta = await tryFetch(selectedModel)
    return `${selectedModel}:::${resposta}`
  } catch (error: any) {
    console.error(`[Ezra LLM] Erro no modelo ${selectedModel}:`, error.message)

    if (fallbackModel) {
      try {
        console.warn(`[Ezra LLM] Tentando fallback: ${fallbackModel}`)
        const respostaFallback = await tryFetch(fallbackModel)
        return `${fallbackModel}:::${respostaFallback}`
      } catch (fallbackError: any) {
        console.error(`[Ezra LLM] Fallback também falhou (${fallbackModel}):`, fallbackError.message)
      }
    }

    return '[❌ Falha ao processar resposta com Ezra]'
  }
}

