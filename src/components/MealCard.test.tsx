import { render, screen } from '@testing-library/react-native';

import { MealCard } from './MealCard';

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

describe('MealCard', () => {
  it('lets a long list of foods wrap inside the card instead of overflowing the screen', async () => {
    // Arrange & Act
    await render(
      <MealCard
        id='meal-1'
        name='Almoço'
        icon='🍽️'
        createdAt={new Date('2025-01-15T12:00:00')}
        foods={[{ name: 'Arroz integral' }, { name: 'Feijão preto' }, { name: 'Peito de frango grelhado' }]}
      />,
    );

    // Assert
    const foods = screen.getByText('Arroz integral, Feijão preto, Peito de frango grelhado');

    expect(foods.parent?.props.className).toContain('flex-1');
  });
});
