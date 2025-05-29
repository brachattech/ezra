import { encoding_for_model } from 'tiktoken';

type Model = 'gpt-3.5-turbo' | 'gpt-4-turbo';

export function countTokens(text: string, model: Model): number {
  const enc = encoding_for_model(model);
  const tokens = enc.encode(text);
  enc.free();  // Libera recursos
  return tokens.length;
}

export function validateTokenLimits(input: string, model: Model): { valid: boolean, reason?: string } {
  const inputTokens = countTokens(input, model);

  const limits = {
    'gpt-3.5-turbo': { input: 1500, output: 1000 },
    'gpt-4-turbo': { input: 20000, output: 2000 }
  };

  const { input: maxInputTokens } = limits[model];

  if (inputTokens > maxInputTokens) {
    return { valid: false, reason: `Limite de ${maxInputTokens} tokens excedido para ${model} (detectado: ${inputTokens}).` };
  }

  return { valid: true };
}

export function getMaxOutputTokens(model: Model): number {
  const limits = {
    'gpt-3.5-turbo': 1000,
    'gpt-4-turbo': 2000
  };
  return limits[model];
}
