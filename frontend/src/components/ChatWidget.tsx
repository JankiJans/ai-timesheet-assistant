import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

// Definiujemy strukturę danych Timesheetu
interface TimesheetState {
  job: string | null;
  date: string | null;
  hours: number | null;
  taskType: string | null;
  billable: boolean | null;
  description: string | null;
}

export const ChatWidget = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // NOWOŚĆ: Stan dla mikrofonu (Punkt 5.1 VoiceInput)
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    // Sprawdzamy, czy przeglądarka wspiera Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Twoja przeglądarka nie obsługuje rozpoznawania mowy. Użyj Chrome lub Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pl-PL'; // Ustawiamy język polski
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      // Pobieramy rozpoznany tekst i wrzucamy do pola input
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Błąd mikrofonu:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };
  
  //Trzymamy wyciągnięte dane w pamięci przeglądarki
  const [extractedData, setExtractedData] = useState<TimesheetState>({
    job: null, date: null, hours: null, taskType: null, billable: null, description: null
  });

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = { role: 'user', text: inputText };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        //Wysyłamy wiadomość ORAZ to, co już do tej pory uzbieraliśmy
        body: JSON.stringify({ 
          message: userMsg.text,
          currentState: extractedData 
        })
      });
      
      const data = await res.json();
      
      //Aktualizujemy naszą pamięć tym, co zwróciło AI
      if (data.entities) {
        setExtractedData(data.entities);
      }
      
      const aiText = data.replyToUser || "Przetworzyłem dane.";
      const aiMsg: Message = { role: 'assistant', text: aiText };
      setMessages((prev) => [...prev, aiMsg]);

    } catch (error) {
      console.error("Błąd sieci:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white shadow-2xl rounded-xl border flex flex-col overflow-hidden font-sans">
      <div className="bg-blue-600 text-white p-4 font-bold flex justify-between items-center">
        <span>AI Timesheet Assistant</span>
        <span className="text-xl">🤖</span>
      </div>

      <div className="h-80 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-gray-400 text-center text-sm mt-10">
            Napisz, co dzisiaj robiłeś. Np. "Wrzucam 3h wczoraj na projekt X"
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div key={index} className={`max-w-[85%] p-3 rounded-lg text-sm ${
            msg.role === 'user' 
              ? 'bg-blue-100 text-blue-900 self-end rounded-br-none' 
              : 'bg-white border text-gray-800 self-start rounded-bl-none shadow-sm'
          }`}>
            {msg.text}
          </div>
        ))}
        {isLoading && <div className="text-gray-400 text-xs self-start animate-pulse">Asystent myśli...</div>}
      </div>

      {/* Pasek narzędzi (Debug) pokazujący, co asystent ma w pamięci */}
      <div className="bg-gray-100 p-2 text-[10px] text-gray-500 font-mono flex flex-wrap gap-2 border-t">
      {extractedData.job && extractedData.date && extractedData.hours && (
        <div className="p-3 bg-green-50 border-t flex flex-col gap-2 border-green-200">
          <div className="text-sm text-green-800">
            <strong>Podsumowanie wpisu:</strong><br/>
            Projekt: {extractedData.job} | Czas: {extractedData.hours}h | Data: {extractedData.date}
          </div>
          <button 
            onClick={() => {
              alert(`Hura! Zapisano timesheet dla ${extractedData.job} w systemie! 🎉`);
              setExtractedData({ job: null, date: null, hours: null, taskType: null, billable: null, description: null });
              setMessages(prev => [...prev, { role: 'assistant', text: 'Wpis został pomyślnie zapisany! W czym jeszcze mogę pomóc?' }]);
            }}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-bold shadow-sm transition-colors"
          >
            Potwierdź i Zapisz (Create Timesheet)
          </button>
        </div>
      )}
        <span>Pamięć AI:</span>
        <span className={extractedData.hours ? "text-green-600 font-bold" : ""}>Czas: {extractedData.hours || '?'}</span> | 
        <span className={extractedData.job ? "text-green-600 font-bold" : ""}>Projekt: {extractedData.job || '?'}</span> | 
        <span className={extractedData.date ? "text-green-600 font-bold" : ""}>Data: {extractedData.date || '?'}</span>
      </div>

      <div className="p-3 bg-white border-t flex gap-2 items-center">
        <button
          onClick={startListening}
          className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
          title="Mów do asystenta"
        >
          {isListening ? '🔴' : '🎤'}
        </button>
        <input 
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Wpisz lub powiedz wiadomość..."
          disabled={isLoading}
        />
        <button 
          onClick={sendMessage}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          Wyślij
        </button>
      </div>
    </div>
  );
};