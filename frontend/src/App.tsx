import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ChatWidget } from './components/ChatWidget';
import { TimesheetList } from './components/TimesheetList';
import { AdminPanel } from './components/AdminPanel';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((lastState) => {
      const newState = !lastState;
      console.log("Przełączono tryb! Czy jest ciemny?", newState);
      return newState;
    });
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4 sm:px-8 font-sans flex justify-center transition-colors duration-300">
        <div className="w-full max-w-7xl">
          
          <header className="mb-8 flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 gap-4 text-center sm:text-left transition-colors duration-300">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">AI Timesheet</h1>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Zarządzaj czasem za pomocą głosu</p>
            </div>
            
            <nav className="flex flex-col xs:flex-row items-center gap-3 xs:gap-4 mt-2 sm:mt-0">
              
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Przełącz tryb ciemny/jasny"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>

              <Link 
                to="/" 
                className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow font-medium hover:bg-blue-700 transition-colors text-sm md:text-base whitespace-nowrap"
              >
                Czat i Wpisy
              </Link>
              <Link 
                to="/admin" 
                className="bg-gray-800 dark:bg-gray-700 text-white px-5 py-2 rounded-lg shadow font-medium hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors text-sm md:text-base whitespace-nowrap"
              >
                ⚙️ Panel Admina
              </Link>
            </nav>
          </header>

          <Routes>
            <Route path="/" element={
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start justify-center">
                <div className="w-full md:flex-1 min-w-0 order-2 md:order-1">
                  <TimesheetList />
                </div>
                <div className="w-full md:w-[350px] lg:w-[400px] shrink-0 order-1 md:order-2">
                  <ChatWidget />
                </div>
              </div>
            } />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>

        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;