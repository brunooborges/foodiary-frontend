import { getMealRefetchInterval, isMealFinished, POLL_INTERVAL_MS } from './mealStatus';

describe('isMealFinished', () => {
  it.each(['success', 'failed'] as const)('is true once the meal is %s', (status) => {
    expect(isMealFinished(status)).toBe(true);
  });

  it.each(['uploading', 'processing', undefined] as const)('is false while the outcome is unknown (%s)', (status) => {
    expect(isMealFinished(status)).toBe(false);
  });
});

describe('getMealRefetchInterval', () => {
  it.each(['uploading', 'processing'] as const)('keeps polling while the meal is %s', (status) => {
    expect(getMealRefetchInterval(status)).toBe(POLL_INTERVAL_MS);
  });

  it('keeps polling until the first answer arrives', () => {
    expect(getMealRefetchInterval(undefined)).toBe(POLL_INTERVAL_MS);
  });

  it.each(['success', 'failed'] as const)('stops polling once the meal is %s', (status) => {
    expect(getMealRefetchInterval(status)).toBe(false);
  });
});
