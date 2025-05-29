import type { NextApiRequest, NextApiResponse } from 'next';
import { correctSpelling } from '@utils/spellchecker';
import { routeToIA } from '@lib/iaRouter';
import { validateTokenLimits, getMaxOutputTokens } from '@utils/tokenizer';
import { callOpenAI } from '@utils/callOpenAI';

type IAResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

// Adicione as declarações de tipo IAProvider e Model se ainda não estiverem importadas
type IAProvider = 'gpt-3.5' | 'gpt-turbo';
type Model = 'gpt-3.5-turbo' | 'gpt-4-turbo';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IAResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ success: false, error: 'Prompt inválido ou ausente.' });
  }

  try {
    // ✅ Correção ortográfica
    const correctedPrompt = await correctSpelling(prompt);

    // ✅ Roteamento do modelo
    const model: IAProvider = routeToIA(correctedPrompt);

    // Correção de tipo para validação
    const modelMapping: Record<IAProvider, Model> = {
      'gpt-3.5': 'gpt-3.5-turbo',
      'gpt-turbo': 'gpt-4-turbo',
    };

    const modelForValidation = modelMapping[model];

    // ✅ Validação de limite de tokens no input
    const { valid, reason } = validateTokenLimits(correctedPrompt, modelForValidation);
    if (!valid) {
      return res.status(400).json({ success: false, error: reason });
    }

    // ✅ Chamada da OpenAI com o modelo roteado e max_tokens automático
    const response = await callOpenAI(correctedPrompt, model);

    return res.status(200).json({ success: true, message: response });

  } catch (error: any) {
    console.error('Erro no handler:', error);
    return res.status(500).json({ success: false, error: 'Erro interno no servidor.' });
  }
}
