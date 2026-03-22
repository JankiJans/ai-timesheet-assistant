import { type TimesheetState } from '../types';

export const sendChatMessage = async (message: string, currentState: TimesheetState) => {
  const response = await fetch('http://localhost:5000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      message: message,
      currentState: currentState 
    })
  });

  if (!response.ok) {
    throw new Error('Błąd połączenia z serwerem');
  }

  return await response.json();
};

export const createTimesheetEntry = async (timesheetData: TimesheetState, idempotencyKey: string) => {
  const response = await fetch('http://localhost:5000/api/timesheet/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timesheetData, idempotencyKey })
  });

  if (!response.ok) {
    throw new Error('Błąd zapisu timesheetu');
  }

  return await response.json();
};

export const fetchTimesheets = async () => {
  const response = await fetch('http://localhost:5000/api/timesheet/list');
  
  if (!response.ok) {
    throw new Error('Błąd pobierania historii wpisów');
  }

  return await response.json();
};

// POBIERANIE PROJEKTÓW
export const fetchJobs = async () => {
  const response = await fetch('http://localhost:5000/api/jobs/list');
  if (!response.ok) throw new Error('Błąd pobierania projektów');
  return await response.json();
};

// DODAWANIE PROJEKTU
export const createJob = async (title: string) => {
  const response = await fetch('http://localhost:5000/api/jobs/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Wysyłamy tylko title
    body: JSON.stringify({ title }) 
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Błąd tworzenia projektu');
  return data;
};