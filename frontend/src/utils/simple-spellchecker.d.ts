declare module 'simple-spellchecker' {
  export function getDictionary(
    locale: string,
    callback?: (err: any, dictionary: any) => void
  ): Promise<any>;

  export interface Dictionary {
    spellCheck(word: string): boolean;
    getSuggestions(word: string): string[];
  }
}
