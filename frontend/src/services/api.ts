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