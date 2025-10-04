import { ReactNode } from 'react';

export const convertToK = (subscribers: ReactNode) => {
  if (typeof subscribers === 'number') {
    return Math.round(subscribers / 1000).toString() + 'k';
  }
};
