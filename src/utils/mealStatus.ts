import { MealStatus } from '../types/Meal';

export const POLL_INTERVAL_MS = 2_000;

// A meal is finished once its analysis is over, whichever way it ended. Nothing about it changes after that.
export function isMealFinished(status: MealStatus | undefined): boolean {
  return status === 'success' || status === 'failed';
}

// A meal is analysed in the background, so the screen polls until the analysis is over.
export function getMealRefetchInterval(status: MealStatus | undefined): number | false {
  return isMealFinished(status) ? false : POLL_INTERVAL_MS;
}
