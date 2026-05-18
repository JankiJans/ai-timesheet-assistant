import { type TimesheetState } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Wysyła wiadomość tekstową użytkownika do asystenta AI w celu automatycznego wypełnienia danych formularza.
 * * @param message - Treść wiadomości od użytkownika. Możliwe wartości: dowolny ciąg znaków (np. "Dodaj 5 godzin do projektu hokej").
 * @param currentState - Aktualny stan formularza. Możliwe wartości: obiekt typu TimesheetState (pola mogą zawierać zaktualizowane wartości lub null).
 * @returns Zwraca obietnicę (Promise), która rozwiązuje się do obiektu JSON zawierającego wygenerowane dane oraz odpowiedź tekstową AI.
 * * @example
 * const currentState = { job: null, hours: null, date: null, description: null, taskType: null, billable: null };
 * const response = await sendChatMessage("dodaj 5h na dzisiaj", currentState);
 * console.log(response.message);
 */
export const sendChatMessage = async (message: string, currentState: TimesheetState, currentBot: string) => {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      message: message,
      currentState: currentState,
      currentBot: currentBot
    })
  });

  if (!response.ok) {
    throw new Error('Błąd połączenia z serwerem');
  }

  return await response.json();
};

/**
 * Tworzy nowy wpis czasu pracy w bazie danych.
 * * @param timesheetData - Dane wpisu do zapisania. Możliwe wartości: obiekt TimesheetState z wymaganymi polami takimi jak job (np. "JOB-001"), hours (np. 5), date (np. "2026-05-10").
 * @param idempotencyKey - Unikalny klucz zapobiegający podwójnemu zapisaniu tego samego wpisu. Możliwe wartości: poprawny string UUIDv4.
 * @returns Zwraca obietnicę (Promise), która rozwiązuje się do utworzonego obiektu wpisu (JSON z bazy danych).
 * * @example
 * const data = { job: 'JOB-001', hours: 8, date: '2026-05-10', description: 'Praca nad API', taskType: 'Dev', billable: true };
 * const newEntry = await createTimesheetEntry(data, "123e4567-e89b-12d3-a456-426614174000");
 */
export const createTimesheetEntry = async (timesheetData: TimesheetState, idempotencyKey: string, currentBot: string) => {
  const response = await fetch(`${API_BASE_URL}/api/timesheet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...timesheetData, idempotencyKey, currentBot }) 
  });

  if (!response.ok) {
    throw new Error('Błąd zapisu timesheetu');
  }

  return await response.json();
};

/**
 * Pobiera historię wszystkich wpisów czasu pracy przypisanych do użytkownika.
 * * @returns Zwraca obietnicę (Promise), która rozwiązuje się do tablicy obiektów JSON reprezentujących wpisy (timesheets).
 * * @example
 * const history = await fetchTimesheets();
 * console.log(`Pobrano ${history.length} wpisów.`);
 */
export const fetchTimesheets = async () => {
  const response = await fetch(`${API_BASE_URL}/api/timesheet`);
  
  if (!response.ok) {
    throw new Error('Błąd pobierania historii wpisów');
  }

  return await response.json();
};

/**
 * Pobiera listę wszystkich dostępnych projektów z bazy danych.
 * * @returns Zwraca obietnicę (Promise), która rozwiązuje się do tablicy projektów. Każdy projekt zawiera m.in. title, jobNumber i status.
 * * @example
 * const jobs = await fetchJobs();
 * const activeJobs = jobs.filter(job => job.status === 'active');
 */
export const fetchJobs = async () => {
  const response = await fetch(`${API_BASE_URL}/api/jobs`);
  if (!response.ok) throw new Error('Błąd pobierania projektów');
  return await response.json();
};

/**
 * Tworzy nowy projekt w systemie (np. w Panelu Admina).
 * * @param title - Nazwa nowego projektu. Możliwe wartości: dowolny ciąg znaków (np. "Projekt Aplikacji Mobilnej").
 * @returns Zwraca obietnicę (Promise), która rozwiązuje się do utworzonego projektu (w tym wygenerowanego jobNumber).
 * * @example
 * const nowaRobota = await createJob("Nowy Projekt Sklepu");
 * console.log(nowaRobota.jobNumber);
 */
export const createJob = async (title: string) => {
  const response = await fetch(`${API_BASE_URL}/api/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }) 
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Błąd tworzenia projektu');
  return data;
};

/**
 * Usuwa całkowicie wybrany projekt z bazy danych.
 * * @param jobNumber - Unikalny identyfikator/numer projektu do usunięcia. Możliwe wartości: string (np. "JOB-005").
 * @returns Zwraca obietnicę (Promise), która rozwiązuje się do obiektu potwierdzającego usunięcie z bazy.
 * * @example
 * await deleteJob("JOB-005");
 * console.log("Projekt został usunięty.");
 */
export const deleteJob = async (jobNumber: string) => {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${jobNumber}`, {
    method: 'DELETE',
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Błąd usuwania projektu');
  return data;
};

/**
 * Usuwa konkretny wpis z historii czasu pracy.
 * * @param id - Identyfikator wpisu timesheet. Możliwe wartości: liczba (np. 15) lub string z ID.
 * @returns Zwraca obietnicę (Promise), która rozwiązuje się do obiektu potwierdzającego usunięcie wpisu.
 * * @example
 * await deleteTimesheet(42);
 * alert("Wpis skasowany!");
 */
export const deleteTimesheet = async (id: number | string) => {
  const response = await fetch(`${API_BASE_URL}/api/timesheet/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Nie udało się usunąć wpisu');
  }
  
  return await response.json();
};

/**
 * Zmienia status dostępności projektu (np. z "aktywnego" na "zamknięty" lub odwrotnie).
 * Zablokowany (zamknięty) projekt nie przyjmuje nowych wpisów czasu pracy.
 * * @param jobNumber - Unikalny numer modyfikowanego projektu. Możliwe wartości: string (np. "JOB-002").
 * @returns Zwraca obietnicę (Promise), która rozwiązuje się do zaaktualizowanego obiektu projektu.
 * * @example
 * const updatedJob = await toggleJobStatus("JOB-002");
 * console.log(`Nowy status projektu to: ${updatedJob.status}`);
 */
export const toggleJobStatus = async (jobNumber: string) => {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${jobNumber}/toggle-status`, {
    method: 'PATCH',
  });
  if (!response.ok) throw new Error('Nie udało się zmienić statusu projektu');
  return await response.json();
};