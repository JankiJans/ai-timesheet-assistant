import { ChatWidget } from './components/ChatWidget';
import { TimesheetList } from './components/TimesheetList';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">AI Timesheet Dashboard</h1>
        <p className="text-gray-500">Zarządzaj swoim czasem za pomocą mowy i sztucznej inteligencji.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Lewa strona: Tabela wpisów */}
        <div className="flex-1 w-full">
          <TimesheetList />
        </div>

        {/* Prawa strona: Nasz Widget (usuwamy z niego klase 'fixed', żeby ładnie osiadł na stronie) */}
        <div className="w-full lg:w-[400px]">
          <ChatWidget />
        </div>
      </div>
    </div>
  );
}

export default App;