//Tu będą wpadać gotowe timesheety od użytkowników
export const TIMESHEETS: any[] = [];

//Tu przechowujemy klucze idempotencji, które już przetworzyliśmy
export const PROCESSED_KEYS: Set<string> = new Set();