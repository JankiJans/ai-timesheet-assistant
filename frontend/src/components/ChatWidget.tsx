import { useState } from 'react';
import { type Message, type TimesheetState } from '../types';
import { sendChatMessage, createTimesheetEntry } from '../services/api';

/**
 * Komponent interaktywnego widżetu czatu z Asystentem AI.
 * Służy do automatycznego parsowania wiadomości tekstowych (lub głosowych)
 * na ustrukturyzowane wpisy czasu pracy (Timesheets).
 * * @component
 * @example
 * return (
 * <ChatWidget />
 * )
 */
export const ChatWidget = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [bot, setBot] = useState('gemini');
  
  const [extractedData, setExtractedData] = useState<TimesheetState>({
    job: null, date: null, hours: null, taskType: null, billable: null, description: null, currentBot: null,
  });

  /**
   * Inicjuje wbudowane w przeglądarkę API rozpoznawania mowy (Web Speech API).
   * Zamienia mowę użytkownika na tekst i wpisuje go do pola input.
   */
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Twoja przeglądarka nie obsługuje rozpoznawania mowy.");
    const recognition = new SpeechRecognition();
    recognition.lang = 'pl-PL';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => setInputText(e.results[0][0].transcript);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  /**
   * Obsługuje wysyłanie wiadomości użytkownika do backendu AI.
   * Aktualizuje historię czatu, blokuje interfejs na czas ładowania,
   * a po otrzymaniu odpowiedzi od AI – aktualizuje stan "extractedData".
   */
  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const userMsg: Message = { role: 'user', text: inputText };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const data = await sendChatMessage(userMsg.text, extractedData, bot);
      if (data.entities) setExtractedData(data.entities);
      setMessages((prev) => [...prev, { role: 'assistant', text: data.replyToUser || "Przetworzyłem dane." }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Wystąpił błąd połączenia z serwerem.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-[500px] bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden font-sans transition-colors duration-300">
      <div className="bg-blue-600 dark:bg-blue-800 text-white p-4 font-bold flex justify-between items-center z-10">
        <span>AI Timesheet Assistant</span>

        <div className="flex border border-blue-400 dark:border-blue-600 rounded-lg overflow-hidden text-xs font-medium cursor-pointer select-none mx-4">
        <div
          onClick={() => setBot('chatgpt')} className={`px-3 py-1.5 transition-colors border-r border-blue-400 dark:border-blue-600 ${bot === 'chatgpt' ? 'bg-white text-green-600' : 'bg-red-700/50 hover:bg-blue-700 text-blue-100'}`}>
          ChatGPT
        </div>
        <div
          onClick={() => setBot('gemini')} className={`px-3 py-1.5 transition-colors ${ bot === 'gemini' ? 'bg-white text-green-600' : 'bg-red-700/50 hover:bg-blue-700 text-blue-100'}`}>
          Gemini
        </div>
      </div>

        <span className="text-xl">🤖</span>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 flex flex-col gap-3 relative z-0 transition-colors duration-300">
        {messages.length === 0 && (
          <div className="text-gray-400 dark:text-gray-500 text-center text-sm mt-10">
            Napisz, co dzisiaj robiłeś. Np. "Wrzucam 3h wczoraj na projekt X"
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div key={index} className={`max-w-[85%] p-3 rounded-lg text-sm break-words whitespace-pre-wrap shadow-sm ${
            msg.role === 'user' 
              ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/60 dark:text-blue-100 self-end rounded-br-none' 
              : 'bg-white border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 border self-start rounded-bl-none'
          }`}>
            {msg.text}
          </div>
        ))}
        {isLoading && <div className="text-gray-400 dark:text-gray-500 text-xs self-start animate-pulse">Asystent myśli...</div>}
      </div>

      {extractedData.job && extractedData.date && extractedData.hours && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-900/50 z-10 flex flex-col gap-2">
          <div className="text-sm text-green-800 dark:text-green-400">
            <strong>Podsumowanie wpisu:</strong><br/>
            Projekt: {extractedData.job} | Czas: {extractedData.hours}h | Data: {extractedData.date}
          </div>
          <button 
            onClick={async () => {
              try {
                const idKey = window.crypto.randomUUID(); 
                await createTimesheetEntry(extractedData, idKey, bot);
                setExtractedData({ job: null, date: null, hours: null, taskType: null, billable: null, description: null, currentBot: null });
                setMessages(prev => [...prev, { role: 'assistant', text: '✅ Wpis został pomyślnie zapisany w bazie! W czym jeszcze mogę pomóc?' }]);
                window.dispatchEvent(new Event('timesheet-added'));
              } catch (err) {
                alert("Nie udało się zapisać wpisu.");
              }
            }}
            className="w-full bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 font-bold shadow-sm transition-colors"
          >
            Potwierdź i Zapisz
          </button>
        </div>
      )}

      <div className="bg-gray-100 dark:bg-gray-900 p-2 text-[10px] text-gray-500 dark:text-gray-400 font-mono flex flex-wrap gap-2 border-t border-gray-200 dark:border-gray-700 z-10 transition-colors duration-300">
        <span>Pamięć AI:</span>
        <span className={extractedData.hours ? "text-green-600 dark:text-green-400 font-bold" : ""}>Czas: {extractedData.hours || '?'}</span> | 
        <span className={extractedData.job ? "text-green-600 dark:text-green-400 font-bold" : ""}>Projekt: {extractedData.job || '?'}</span> | 
        <span className={extractedData.date ? "text-green-600 dark:text-green-400 font-bold" : ""}>Data: {extractedData.date || '?'}</span>
      </div>

      <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-2 items-center z-10 transition-colors duration-300">
        <button
          onClick={startListening}
          className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          title="Mów do asystenta"
        >
          {isListening ? '🔴' : '🎤'}
        </button>
        <input 
          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 transition-colors"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="W czym mogę ci dzisiaj pomóc?"
          disabled={isLoading}
        />
        <button 
          onClick={sendMessage}
          disabled={isLoading}
          className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-blue-800 transition-colors"
        >
          Wyślij
        </button>
      </div>
    </div>
  );
};