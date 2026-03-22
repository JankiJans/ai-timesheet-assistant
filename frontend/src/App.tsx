import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ChatWidget } from './components/ChatWidget';
import { TimesheetList } from './components/TimesheetList';
import { AdminPanel } from './components/AdminPanel';

function App() {
  return (
    <BrowserRouter>
      {/* Dodaliśmy wyśrodkowanie i minimalną wysokość ekranu */}
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-8 font-sans flex justify-center">
        
        {/* Główny kontener - ogranicza szerokość na wielkich monitorach (max-w-7xl to ok. 1280px) */}
        <div className="w-full max-w-7xl">
          
          <header className="mb-8 flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">AI Timesheet</h1>
              <p className="text-sm md:text-base text-gray-500">Zarządzaj czasem za pomocą głosu</p>
            </div>
            <nav className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/" 
                className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow font-medium hover:bg-blue-700 transition-colors text-sm md:text-base"
              >
                Czat i Wpisy
              </Link>
              <Link 
                to="/admin" 
                className="bg-gray-800 text-white px-5 py-2 rounded-lg shadow font-medium hover:bg-gray-900 transition-colors text-sm md:text-base"
              >
                ⚙️ Panel Admina
              </Link>
            </nav>
          </header>

          <Routes>
            {/* STRONA GŁÓWNA - Zmieniliśmy flex-col na lg:flex-row i upewniliśmy się, że jest gap-8 */}
            <Route path="/" element={
              <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
                <div className="flex-1 w-full min-w-0"> {/* min-w-0 zapobiega wylewaniu się tabeli z flexboxa! */}
                  <TimesheetList />
                </div>
                <div className="w-full lg:w-[400px] shrink-0"> {/* shrink-0 zapobiega zgniataniu czatu */}
                  <ChatWidget />
                </div>
              </div>
            } />

            {/* STRONA PANELU ADMINA */}
            <Route path="/admin" element={
              <AdminPanel />
            } />
          </Routes>

        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;