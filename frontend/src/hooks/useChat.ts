import { useState } from 'react';

interface Message {
  role: 'user' | 'ezra';
  content: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);  // ✅ Adicionado o estado de loading

  const sendMessage = async (message: string) => {
    const userMessage = { role: 'user' as const, content: message };
    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);  // ✅ Inicia o loading

    try {
      const res = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: message })
      });

      const data = await res.json();

      const ezraReply = {
        role: 'ezra' as const,
        content: data.message || 'Ezra não conseguiu responder.'
      };

      setMessages((prev) => [...prev, ezraReply]);
    } catch (error) {
      const ezraReply = {
        role: 'ezra' as const,
        content: 'Erro ao comunicar com a IA.'
      };

      setMessages((prev) => [...prev, ezraReply]);
    } finally {
      setIsLoading(false);  // ✅ Finaliza o loading
    }
  };

  return {
    messages,
    sendMessage,
    isLoading  // ✅ Exporta o estado de loading
  };
}

