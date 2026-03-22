import { useState, useEffect } from 'react';
import { fetchJobs, createJob, deleteJob } from '../services/api'; // Dodany import deleteJob

export const AdminPanel = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await createJob(title);
      setTitle('');
      loadJobs(); 
      alert("✅ Projekt dodany pomyślnie!");
    } catch (error: any) {
      alert(`❌ Błąd: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // NOWA FUNKCJA: Obsługa usuwania
  const handleDeleteJob = async (jobNumber: string, jobTitle: string) => {
    // Dodajemy zabezpieczenie, żeby nikt nie usunął projektu przez przypadek
    const isConfirmed = window.confirm(`⚠️ Czy na pewno chcesz usunąć projekt "${jobTitle}" (${jobNumber})?`);
    if (!isConfirmed) return;

    try {
      await deleteJob(jobNumber);
      loadJobs(); // Odświeżamy listę po usunięciu
      alert("🗑️ Projekt został usunięty.");
    } catch (error: any) {
      alert(`❌ Nie można usunąć: ${error.message}`);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span>⚙️</span> Panel Administracyjny - Zarządzanie Projektami
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <form onSubmit={handleCreateJob} className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Dodaj nowy projekt</h3>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Nazwa (np. Strona internetowa)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gray-800 text-white p-3 rounded font-bold hover:bg-gray-900 transition-colors disabled:bg-gray-400"
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
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="h-[400px] overflow-y-auto border rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 sticky top-0 shadow-sm">
                <tr>
                  <th className="p-4 font-bold text-gray-600">ID Projektu</th>
                  <th className="p-4 font-bold text-gray-600">Nazwa Projektu</th>
                  <th className="p-4 font-bold text-gray-600">Status</th>
                  <th className="p-4 font-bold text-gray-600 text-center">Akcje</th> {/* NOWA KOLUMNA */}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      Brak projektów pasujących do wyszukiwania.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map(job => (
                    <tr key={job.jobNumber} className="hover:bg-gray-50 text-base group">
                      <td className="p-4 font-mono text-gray-500">{job.jobNumber}</td>
                      <td className="p-4 font-medium text-gray-800">{job.title}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 text-xs rounded-full uppercase font-bold ${job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {/* PRZYCISK USUWANIA */}
                        <button
                          onClick={() => handleDeleteJob(job.jobNumber, job.title)}
                          className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded transition-colors opacity-50 group-hover:opacity-100"
                          title="Usuń projekt"
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
    </div>
  );
};