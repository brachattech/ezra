type IAProvider = 'gpt-3.5' | 'gpt-turbo';

/**
 * Roteia a entrada do usuário para o modelo de IA apropriado.
 * 
 * - Se o texto contém código ou palavras-chave de análise profunda,
 *   retorna 'gpt-turbo' para aproveitar maior capacidade e tokens.
 * - Caso contrário, usa o modelo padrão 'gpt-3.5'.
 * 
 * @param input Texto de entrada do usuário
 * @returns O nome do modelo IA a ser usado
 */
export function routeToIA(input: string): IAProvider {
  // Regex para detectar código fonte
  const codeRegex = /(function|const|let|var|class|import|export|=>|\{|\}|\(|\)|;)/i;

  // Palavras-chave que indicam análise textual detalhada
  const analysisKeywords = /(análise|analisar|contrato|síntese|estudo|detalhamento)/i;

  // Se detecta código, usar modelo turbo (mais potente)
  if (codeRegex.test(input)) {
    return 'gpt-turbo';
  }

  // Se detecta análise ou estudo profundo, também usa turbo
  if (analysisKeywords.test(input)) {
    return 'gpt-turbo';
  }

  // Caso padrão, modelo 3.5 mais econômico
  return 'gpt-3.5';
}


