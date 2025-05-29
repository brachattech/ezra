const usageLimits = {
  mistral: 1000,
  claude: 100,
  perplexity: 200,
  gemini: 300,
  notebooklm: 150
};

const usageCounts: { [key in keyof typeof usageLimits]?: number } = {};

export function canUse(service: keyof typeof usageLimits): boolean {
  const used = usageCounts[service] || 0;
  return used < usageLimits[service];
}

export function recordUsage(service: keyof typeof usageLimits): void {
  usageCounts[service] = (usageCounts[service] || 0) + 1;
}
