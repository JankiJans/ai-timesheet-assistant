import { useEffect, useState } from 'react';
import { fetchTimesheets } from '../services/api';

export const TimesheetList = () => {
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Funkcja ładująca dane
  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchTimesheets();
      setTimesheets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Uruchamia się raz po załadowaniu komponentu
  useEffect(() => {
    loadData();
    
    // Prosty trick: nasłuchujemy na własne zdarzenie, żeby odświeżyć tabelę
    // gdy czat doda nowy wpis!
    window.addEventListener('timesheet-added', loadData);
    return () => window.removeEventListener('timesheet-added', loadData);
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border w-full max-w-3xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Historia wpisów</h2>
        <button 
          onClick={loadData}
          className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-gray-600 transition-colors"
        >
          Odśwież 🔄
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 py-10">Ładowanie danych...</div>
      ) : timesheets.length === 0 ? (
        <div className="text-center text-gray-500 py-10 border-2 border-dashed rounded-lg">
          Brak wpisów w bazie. Dodaj coś przez czat!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Projekt</th>
                <th className="p-3 text-center">Godziny</th>
                <th className="p-3">Typ zadania / Opis</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {timesheets.map((ts) => (
                <tr key={ts.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 whitespace-nowrap">{ts.date}</td>
                  {/* Dzięki 'include: { job: true }' w Prismie mamy dostęp do tytułu! */}
                  <td className="p-3 font-medium text-blue-700">{ts.job.title}</td>
                  <td className="p-3 text-center font-bold">{ts.hours}h</td>
                  <td className="p-3 text-gray-600">
                    {ts.taskType && <span className="bg-gray-200 text-xs px-2 py-1 rounded mr-2">{ts.taskType}</span>}
                    {ts.description || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};