import { useEffect, useState } from 'react';
// PAMIĘTAJ O ZAIMPORTOWANIU deleteTimesheet!
import { fetchTimesheets, deleteTimesheet } from '../services/api';

export const TimesheetList = () => {
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDescription, setSelectedDescription] = useState<string | null>(null);
  
  // NOWOŚĆ: Stany do usuwania i powiadomień
  const [entryToDelete, setEntryToDelete] = useState<any | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isToastFading, setIsToastFading] = useState(false);

  // Funkcja obsługująca ładne powiadomienia (Toast)
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setIsToastFading(false);
    setTimeout(() => setIsToastFading(true), 2500);
    setTimeout(() => setNotification(null), 3000);
  };

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

  useEffect(() => {
    loadData();
    window.addEventListener('timesheet-added', loadData);
    return () => window.removeEventListener('timesheet-added', loadData);
  }, []);

  // NOWOŚĆ: Właściwa funkcja usuwająca wpis po potwierdzeniu w Modalu
  const confirmDelete = async () => {
    if (!entryToDelete) return;

    try {
      await deleteTimesheet(entryToDelete.id);
      loadData(); // Odświeżamy tabelę po usunięciu
      showNotification("Wpis został usunięty.", "success");
    } catch (error: any) {
      showNotification(`Błąd usuwania: ${error.message}`, "error");
    } finally {
      setEntryToDelete(null); // Zamykamy modal
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-full flex flex-col h-[500px] relative transition-colors duration-300">
      
      {/* TOAST NOTIFICATION (Powiadomienie) */}
      {notification && (
        <div className={`fixed bottom-8 right-8 p-4 rounded-xl shadow-2xl font-bold text-white z-[100] transition-all duration-500 ease-in-out flex items-center gap-3
          ${notification.type === 'success' ? 'bg-green-500 dark:bg-green-600' : 'bg-red-500 dark:bg-red-600'}
          ${isToastFading ? 'opacity-0 translate-y-4 scale-90' : 'opacity-100 translate-y-0 scale-100'}
        `}>
          <span className="text-xl">{notification.type === 'success' ? '✅' : '❌'}</span>
          <span className="text-sm">{notification.message}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 shrink-0">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Historia wpisów</h2>
        <button onClick={loadData} className="text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1 rounded text-gray-600 dark:text-gray-300 transition-colors">
          Odśwież 🔄
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-10 flex-1 flex items-center justify-center">Ładowanie danych...</div>
      ) : timesheets.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-10 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg flex-1 flex items-center justify-center">
          Brak wpisów w bazie. Dodaj coś przez czat!
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="w-full text-left text-sm relative">
            <thead className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 sticky top-0 z-10 shadow-sm transition-colors duration-300">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Projekt</th>
                <th className="p-3 text-center">Godziny</th>
                <th className="p-3 w-1/3 sm:w-1/2">Typ / Opis</th>
                <th className="p-3 text-center">Akcje</th> {/* NOWA KOLUMNA */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300">
              {timesheets.map((ts) => (
                <tr key={ts.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="p-3 whitespace-nowrap text-gray-600 dark:text-gray-400">{ts.date}</td>
                  <td className="p-3 font-medium text-blue-700 dark:text-blue-400">{ts.job.title}</td>
                  <td className="p-3 text-center font-bold dark:text-white">{ts.hours}h</td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">
                    <div className="flex flex-wrap items-center gap-2">
                      {ts.taskType && (
                        <span className="bg-gray-200 dark:bg-gray-700 text-[10px] sm:text-xs px-2 py-1 rounded shrink-0 font-medium dark:text-gray-200">
                          {ts.taskType}
                        </span>
                      )}
                      <span className="break-all">
                        {ts.description ? (
                          <>
                            <span className="hidden sm:inline">
                              {ts.description.length > 40 ? (
                                <>
                                  {ts.description.substring(0, 40)}...{' '}
                                  <button onClick={() => setSelectedDescription(ts.description)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-bold hover:underline shrink-0 ml-1">
                                    (czytaj)
                                  </button>
                                </>
                              ) : ts.description}
                            </span>
                            <button onClick={() => setSelectedDescription(ts.description)} className="sm:hidden text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50 border border-blue-200 dark:border-blue-700 text-[10px] font-bold px-2 py-1 rounded shadow-sm whitespace-nowrap">
                              📄 Pokaż opis
                            </button>
                          </>
                        ) : '-'}
                      </span>
                    </div>
                  </td>
                  {/* NOWA KOMÓRKA Z PRZYCISKIEM USUWANIA */}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setEntryToDelete(ts)}
                      className="text-red-500 hover:text-white hover:bg-red-500 p-1.5 rounded transition-colors opacity-50 group-hover:opacity-100"
                      title="Usuń wpis"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL Z PEŁNYM OPISEM (zostaje bez zmian) */}
      {selectedDescription && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all border dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span>📝</span> Pełny opis zadania
            </h3>
            <div className="text-gray-700 dark:text-gray-300 mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 max-h-[60vh] overflow-y-auto break-words whitespace-pre-wrap text-sm leading-relaxed">
              {selectedDescription}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setSelectedDescription(null)} className="px-5 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors shadow-sm">
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOWOŚĆ: MODAL POTWIERDZENIA USUNIĘCIA WPISU */}
      {entryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all border border-transparent dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-red-500">⚠️</span> Potwierdź usunięcie
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Czy na pewno chcesz usunąć wpis z dnia <span className="font-bold text-gray-800 dark:text-white">{entryToDelete.date}</span> (Projekt: {entryToDelete.job?.title}, {entryToDelete.hours}h)?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEntryToDelete(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors"
              >
                Tak, usuń
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};