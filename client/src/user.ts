import { v4 as uuid } from 'uuid';

export const userId = localStorage.getItem('gok-user-id') || uuid();
localStorage.setItem('gok-user-id', userId);
