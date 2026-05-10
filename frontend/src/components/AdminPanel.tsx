import { useState, useEffect } from 'react';
import { fetchJobs, createJob, deleteJob, toggleJobStatus } from '../services/api';

/**
 * Komponent głównego widoku Panelu Administracyjnego.
 * Odpowiada za zarządzanie projektami (Jobs) w systemie.
 * Pozwala na:
 * - Pobieranie i wyświetlanie listy projektów z bazy danych.
 * - Dodawanie nowych projektów.
 * - Usuwanie projektów (z użyciem modala potwierdzającego).
 * - Zmianę statusu projektu (aktywny / zamknięty).
 * * @component
 * @example
 * // Użycie w głównym pliku aplikacji (np. App.tsx)
 * return (
 * <div className="layout">
 * <AdminPanel />
 * </div>
 * )
 */
export const AdminPanel = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [jobToDelete, setJobToDelete] = useState<{jobNumber: string, title: string} | null>(null);

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isToastFading, setIsToastFading] = useState(false);

  /**
   * Wyświetla powiadomienie typu "Toast" w prawym dolnym rogu ekranu.
   * Powiadomienie automatycznie znika po 3 sekundach.
   * * @param message - Treść powiadomienia do wyświetlenia.
   * @param type - Typ powiadomienia określający jego kolor ('success' - zielony, 'error' - czerwony).
   */
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setIsToastFading(false);
    
    setTimeout(() => {
      setIsToastFading(true);
    }, 2500);

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  /**
   * Asynchronicznie pobiera listę projektów z API i zapisuje ją w stanie komponentu.
   */
  const loadJobs = async () => {
    try {
      const data = await fetchJobs();
      setJobs(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  /**
   * Obsługuje wysłanie formularza dodawania nowego projektu.
   * Waliduje puste pola, wywołuje API i odświeża listę projektów.
   */
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await createJob(title);
      setTitle('');
      loadJobs(); 
      showNotification("Projekt dodany pomyślnie!", "success"); 
    } catch (error: any) {
      showNotification(`Błąd: ${error.message}`, "error"); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (jobNumber: string, title: string) => {
    setJobToDelete({ jobNumber, title });
  };

  /**
   * Wykonuje ostateczne usunięcie projektu po potwierdzeniu przez użytkownika w modalu.
   */
  const confirmDelete = async () => {
    if (!jobToDelete) return;

    try {
      await deleteJob(jobToDelete.jobNumber);
      loadJobs(); 
      showNotification("Projekt został usunięty.", "success");
    } catch (error: any) {
      showNotification(`Nie można usunąć: ${error.message}`, "error");
    } finally {
      setJobToDelete(null); 
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-full relative transition-colors duration-300">
      
      {notification && (
        <div className={`fixed bottom-8 right-8 p-4 rounded-xl shadow-2xl font-bold text-white z-[100] transition-all duration-500 ease-in-out flex items-center gap-3
          ${notification.type === 'success' ? 'bg-green-500 dark:bg-green-600' : 'bg-red-500 dark:bg-red-600'}
          ${isToastFading ? 'opacity-0 translate-y-10 scale-90' : 'opacity-100 translate-y-0 scale-100'}
        `}>
          <span className="text-xl">{notification.type === 'success' ? '✅' : '❌'}</span>
          <span>{notification.message}</span>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 transition-colors duration-300">
        <span>⚙️</span> Panel Administracyjny - Zarządzanie Projektami
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <form onSubmit={handleCreateJob} className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 transition-colors duration-300">Dodaj nowy projekt</h3>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Nazwa (np. Strona internetowa)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-300"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gray-800 dark:bg-blue-600 text-white p-3 rounded font-bold hover:bg-gray-900 dark:hover:bg-blue-700 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600"
              >
                {isLoading ? 'Dodawanie...' : 'Dodaj projekt'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 xl:col-span-3 min-w-0">
          <div className="mb-4">
            <input
              type="text"
              placeholder="🔍 Szukaj projektu po nazwie lub ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-300"
            />
          </div>

          <div className="h-[400px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg transition-colors duration-300">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 sticky top-0 shadow-sm z-10 transition-colors duration-300">
                <tr>
                  <th className="p-4 font-bold">ID Projektu</th>
                  <th className="p-4 font-bold">Nazwa Projektu</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-center">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400">
                      Brak projektów pasujących do wyszukiwania.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map(job => (
                    <tr key={job.jobNumber} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 text-base group transition-colors duration-300">
                        <td className="p-4 font-mono text-gray-500 dark:text-gray-400">{job.jobNumber}</td>
                        <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{job.title}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 text-xs rounded-full uppercase font-bold 
                            ${job.status === 'active' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="p-4 text-center flex justify-center gap-2">
                        <button
                          onClick={async () => {
                            try {
                              await toggleJobStatus(job.jobNumber);
                              loadJobs(); 
                              showNotification(`Projekt ${job.status === 'active' ? 'zdezaktywowany' : 'aktywowany'}`, "success");
                            } catch (err) {
                              showNotification("Błąd zmiany statusu", "error");
                            }
                          }}
                          className={`p-2 rounded transition-colors ${
                            job.status === 'active' 
                              ? 'text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/30' 
                              : 'text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30'
                          }`}
                          title={job.status === 'active' ? 'Dezaktywuj projekt' : 'Aktywuj projekt'}
                        >
                          {job.status === 'active' ? '🚫' : '✅'}
                        </button>

                        <button
                          onClick={() => handleDeleteClick(job.jobNumber, job.title)}
                          className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded transition-colors opacity-50 group-hover:opacity-100"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {jobToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all border border-transparent dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-red-500">⚠️</span> Potwierdź usunięcie
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Czy na pewno chcesz usunąć projekt <span className="font-bold text-gray-800 dark:text-white">"{jobToDelete.title}"</span> ({jobToDelete.jobNumber})?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setJobToDelete(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors"
              >
                Tak, usuń projekt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};