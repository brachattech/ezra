interface Props {
  messages: string[];
}

export default function ChatMessage({ messages }: Props) {
  return (
    <div className="space-y-2 mt-4 flex flex-col">
      {messages.map((msg, idx) => {
        const isUser = msg.startsWith('Você:');
        return (
          <div
            key={idx}
            className={`max-w-[70%] p-3 rounded-3xl break-words text-sm ${
              isUser
                ? 'bg-green-500 text-white self-end rounded-br-none'
                : 'bg-blue-500 text-white self-start rounded-bl-none'
            }`}
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {msg.replace(/^Você:\s?/, '').replace(/^Ezra:\s?/, '')}
          </div>
        );
      })}
    </div>
  );
}
