import * as spellchecker from 'simple-spellchecker';

export async function correctSpelling(input: string): Promise<string> {
  const dictionary = await spellchecker.getDictionary("pt-BR");
  const words = input.split(' ');

  const corrected = words.map(word => {
    if (!dictionary.spellCheck(word)) {
      const suggestions = dictionary.getSuggestions(word);
      return suggestions[0] || word;
    }
    return word;
  });

  return corrected.join(' ');
}
