import { initializeApp } from 'firebase/app';

import { environment } from '../../environments/environment';

export const initializeFirebase = (): void => {
  initializeApp(environment.firebase);
};
