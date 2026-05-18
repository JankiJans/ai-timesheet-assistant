export interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export interface TimesheetState {
  job: string | null;
  date: string | null;
  hours: number | null;
  taskType: string | null;
  billable: boolean | null;
  description: string | null;
  currentBot: string | null;
}