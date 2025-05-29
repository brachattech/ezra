import { useState } from 'react';
import { Send } from 'lucide-react';

interface Props {
  onSend: (message: string) => void;
}

export default function ChatInput({ onSend }: Props) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage('');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto flex items-center bg-purple-700 rounded-t-xl p-2 shadow">


      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-grow px-4 py-2 rounded-full outline-none bg-purple-700 text-white placeholder-purple-300"
      />
      <button
        onClick={handleSend}
        className="ml-2 p-2 bg-purple-600 rounded-full text-white hover:bg-purple-500 transition"
      >
        <Send size={20} className="text-white" />
      </button>
    </div>
  );
}
