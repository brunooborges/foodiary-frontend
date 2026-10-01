import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react-native';

import { MealsList } from './MealsList';

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { calories: 2000, proteins: 100, carbohydrates: 200, fats: 60 } }),
}));

jest.mock('../services/httpClient', () => ({
  httpClient: { get: jest.fn().mockResolvedValue({ data: { meals: [] } }) },
}));

jest.mock('./DailyStats', () => ({ DailyStats: () => null }));
jest.mock('./DateSwitcher', () => ({ DateSwitcher: () => null }));

describe('MealsList', () => {
  it('keeps the empty-state message away from the screen edges', async () => {
    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    await render(
      <QueryClientProvider client={queryClient}>
        <MealsList />
      </QueryClientProvider>,
    );

    // Assert
    const message = await screen.findByText('Nenhuma refeição cadastrada...');

    expect(message.props.className).toContain('mx-5');
  });
});
