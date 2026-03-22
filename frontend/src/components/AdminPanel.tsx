import { useState, useEffect } from 'react';
import { fetchJobs, createJob } from '../services/api';

export const AdminPanel = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [title, setTitle] = useState(''); // Zostawiamy tylko stan dla tytułu
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
      // Przekazujemy tylko tytuł projektu
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

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border w-full max-w-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>⚙️</span> Panel Administracyjny
      </h2>

      <form onSubmit={handleCreateJob} className="mb-6 bg-gray-50 p-4 rounded-lg border">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Dodaj nowy projekt</h3>
        <div className="flex flex-col gap-3">
          {/* Usunęliśmy input jobNumber! Został tylko ten od nazwy */}
          <input
            type="text"
            placeholder="Nazwa (np. Strona internetowa bonzo)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gray-800 text-white p-2 rounded text-sm hover:bg-gray-900 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? 'Dodawanie...' : 'Dodaj projekt'}
          </button>
        </div>
      </form>

      <div className="h-48 overflow-y-auto border rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Nazwa</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {jobs.map(job => (
              <tr key={job.jobNumber} className="hover:bg-gray-50">
                <td className="p-2 font-mono text-xs text-gray-500">{job.jobNumber}</td>
                <td className="p-2 font-medium">{job.title}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 text-[10px] rounded-full uppercase font-bold ${job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {job.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};