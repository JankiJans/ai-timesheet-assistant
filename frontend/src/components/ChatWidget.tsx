import { useState } from 'react';

export const ChatWidget = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<any>(null);

  const sendMessage = async () => {
    const res = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    setResponse(data);
  };

  return (
    <div className="fixed bottom-5 right-5 w-80 p-4 bg-white shadow-xl rounded-lg border">
      <h2 className="font-bold mb-2">AI Assistant 🤖</h2>
      <div className="h-48 overflow-y-auto mb-2 text-sm border-b">
        {response && (
          <pre className="whitespace-pre-wrap p-2 bg-gray-50">
            {JSON.stringify(response, null, 2)}
          </pre>
        )}
      </div>
      <input 
        className="w-full p-2 border rounded"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Wpisz wiadomość..."
      />
      <button 
        onClick={sendMessage}
        className="w-full mt-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Wyślij
      </button>
    </div>
  );
};