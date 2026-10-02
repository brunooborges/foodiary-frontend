import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { httpClient } from '../services/httpClient';
import { Meal } from '../types/Meal';
import { MealDetailsScreen } from './MealDetailsScreen';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));
jest.mock('../services/httpClient', () => ({ httpClient: { get: jest.fn() } }));

const get = httpClient.get as jest.Mock;

const meal: Meal = {
  id: 'meal-1',
  status: 'success',
  icon: '🍗',
  name: 'Jantar',
  createdAt: new Date().toISOString(),
  foods: [{ name: 'Arroz', quantity: '150g', calories: 193, carbohydrates: 42, proteins: 3.5, fats: 0.4 }],
};

const unfinishedMeal = (status: Meal['status']): Meal => ({ ...meal, status, name: '', foods: [] });

const LOAD_ERROR = 'Não foi possível carregar a refeição';
const LOADING = 'Analisando sua refeição';

let queryClient: QueryClient;

async function renderScreen() {
  await render(
    <QueryClientProvider client={queryClient}>
      <MealDetailsScreen mealId='meal-1' />
    </QueryClientProvider>,
  );
}

describe('MealDetailsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // No retries and no garbage-collection timers, so nothing outlives a test.
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  });

  afterEach(() => {
    queryClient.clear();
    jest.useRealTimers();
  });

  it('asks the API for the meal that was opened', async () => {
    // Arrange
    get.mockResolvedValue({ data: { meal } });

    // Act
    await renderScreen();
    await screen.findByRole('header', { name: 'Jantar' });

    // Assert
    expect(get).toHaveBeenCalledWith('/meals/meal-1');
  });

  it('shows the analysed meal once it is ready, not raw JSON', async () => {
    // Arrange
    get.mockResolvedValue({ data: { meal } });

    // Act
    await renderScreen();

    // Assert
    expect(await screen.findByRole('header', { name: 'Jantar' })).toBeTruthy();
    expect(screen.getByText('Arroz')).toBeTruthy();
    expect(screen.queryByText(/"status"/)).toBeNull();
  });

  it.each(['uploading', 'processing'] as const)('shows a loading state while the meal is %s', async (status) => {
    // Arrange
    get.mockResolvedValue({ data: { meal: unfinishedMeal(status) } });

    // Act
    await renderScreen();

    // Assert
    expect(await screen.findByRole('progressbar', { name: LOADING })).toBeTruthy();
    expect(screen.queryByText('Voltar')).toBeNull();
  });

  describe('polling', () => {
    it('keeps asking while the meal is processing and shows it as soon as it is ready', async () => {
      // Arrange
      jest.useFakeTimers();
      get.mockResolvedValueOnce({ data: { meal: unfinishedMeal('processing') } }).mockResolvedValue({ data: { meal } });
      await renderScreen();
      await screen.findByLabelText(LOADING);

      // Act
      await act(async () => {
        jest.advanceTimersByTime(2_000);
      });

      // Assert
      expect(await screen.findByRole('header', { name: 'Jantar' })).toBeTruthy();
      expect(get).toHaveBeenCalledTimes(2);
    });

    it('stops asking once the analysis has failed', async () => {
      // Arrange
      jest.useFakeTimers();
      get.mockResolvedValue({ data: { meal: unfinishedMeal('failed') } });
      await renderScreen();
      await screen.findByText('Não foi possível analisar sua refeição');

      // Act
      await act(async () => {
        jest.advanceTimersByTime(20_000);
      });

      // Assert
      expect(get).toHaveBeenCalledTimes(1);
    });

    it('keeps trying after one failed attempt while the meal is still processing, instead of freezing', async () => {
      // Arrange
      jest.useFakeTimers();
      get
        .mockResolvedValueOnce({ data: { meal: unfinishedMeal('processing') } })
        .mockRejectedValueOnce(new Error('offline'))
        .mockResolvedValue({ data: { meal } });
      await renderScreen();
      await screen.findByLabelText(LOADING);

      // Act: the second request fails, the third succeeds.
      await act(async () => {
        jest.advanceTimersByTime(2_000);
      });
      expect(await screen.findByText(LOAD_ERROR)).toBeTruthy();

      await act(async () => {
        jest.advanceTimersByTime(2_000);
      });

      // Assert
      expect(await screen.findByRole('header', { name: 'Jantar' })).toBeTruthy();
      expect(get).toHaveBeenCalledTimes(3);
    });
  });

  it('refreshes a meal that was still processing when it was last seen, instead of waiting for the next tick', async () => {
    // Arrange: the screen was left while the analysis was running, then reopened after it finished.
    queryClient.setQueryData(['meal', 'meal-1'], unfinishedMeal('processing'));
    get.mockResolvedValue({ data: { meal } });

    // Act
    await renderScreen();

    // Assert
    expect(await screen.findByRole('header', { name: 'Jantar' })).toBeTruthy();
  });

  it('explains that the analysis failed and lets the user go back, without offering a pointless retry', async () => {
    // Arrange
    get.mockResolvedValue({ data: { meal: unfinishedMeal('failed') } });
    await renderScreen();

    // Assert
    expect(await screen.findByText('Não foi possível analisar sua refeição')).toBeTruthy();
    expect(screen.queryByLabelText(LOADING)).toBeNull();
    expect(screen.queryByText('Tentar novamente')).toBeNull();

    // Act
    await fireEvent.press(screen.getByText('Voltar'));

    // Assert
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  describe('when the meal cannot be loaded', () => {
    it('shows an error, not an endless spinner', async () => {
      // Arrange
      get.mockRejectedValue(new Error('network down'));

      // Act
      await renderScreen();

      // Assert
      expect(await screen.findByText(LOAD_ERROR)).toBeTruthy();
      expect(screen.queryByLabelText(LOADING)).toBeNull();
    });

    it('lets the user try again without leaving the screen', async () => {
      // Arrange
      get.mockRejectedValueOnce(new Error('network down')).mockResolvedValue({ data: { meal } });
      await renderScreen();
      await screen.findByText(LOAD_ERROR);

      // Act
      await fireEvent.press(screen.getByText('Tentar novamente'));

      // Assert
      expect(await screen.findByRole('header', { name: 'Jantar' })).toBeTruthy();
    });

    it('also shows the error, with a retry, when a refresh fails while the meal is still processing', async () => {
      // Arrange
      get.mockResolvedValueOnce({ data: { meal: unfinishedMeal('processing') } }).mockRejectedValueOnce(new Error('offline'));
      await renderScreen();
      await screen.findByLabelText(LOADING);

      // Act
      await act(async () => {
        await queryClient.refetchQueries({ queryKey: ['meal', 'meal-1'] });
      });

      // Assert
      expect(await screen.findByText(LOAD_ERROR)).toBeTruthy();

      // Act: retry
      get.mockResolvedValue({ data: { meal } });
      await fireEvent.press(screen.getByText('Tentar novamente'));

      // Assert
      expect(await screen.findByRole('header', { name: 'Jantar' })).toBeTruthy();
    });
  });
});
