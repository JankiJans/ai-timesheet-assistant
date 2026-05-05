import { type TimesheetState } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const sendChatMessage = async (message: string, currentState: TimesheetState) => {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
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
  const response = await fetch(`${API_BASE_URL}/api/timesheet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...timesheetData, idempotencyKey }) 
  });

  if (!response.ok) {
    throw new Error('Błąd zapisu timesheetu');
  }

  return await response.json();
};

export const fetchTimesheets = async () => {
  const response = await fetch(`${API_BASE_URL}/api/timesheet`);
  
  if (!response.ok) {
    throw new Error('Błąd pobierania historii wpisów');
  }

  return await response.json();
};

// POBIERANIE PROJEKTÓW
export const fetchJobs = async () => {
  const response = await fetch(`${API_BASE_URL}/api/jobs`);
  if (!response.ok) throw new Error('Błąd pobierania projektów');
  return await response.json();
};

// DODAWANIE PROJEKTU
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

// USUWANIE PROJEKTU
export const deleteJob = async (jobNumber: string) => {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${jobNumber}`, {
    method: 'DELETE',
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Błąd usuwania projektu');
  return data;
};

// USUWANIE TIMESHEETU
export const deleteTimesheet = async (id: number | string) => {
  const response = await fetch(`${API_BASE_URL}/api/timesheet/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Nie udało się usunąć wpisu');
  }
  
  return await response.json();
};

// ZMIANA STATUSU PROJEKTU
export const toggleJobStatus = async (jobNumber: string) => {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${jobNumber}/toggle-status`, {
    method: 'PATCH',
  });
  if (!response.ok) throw new Error('Nie udało się zmienić statusu projektu');
  return await response.json();
};