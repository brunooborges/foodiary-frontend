import { fireEvent, render, screen } from '@testing-library/react-native';

import { Meal } from '../types/Meal';
import { MealDetailsContent } from './MealDetailsContent';

// "Today" is pinned so the expected dates never depend on the day (or the minute) the tests run.
const NOW = new Date('2025-01-15T20:00:00');

const meal: Meal = {
  id: 'meal-1',
  status: 'success',
  icon: '🍗',
  name: 'Jantar',
  createdAt: '2025-01-15T19:30:00',
  foods: [
    { name: 'Arroz branco cozido', quantity: '150g', calories: 193, carbohydrates: 42, proteins: 3.5, fats: 0.4 },
    { name: 'Peito de frango grelhado', quantity: '100g', calories: 165, carbohydrates: 0, proteins: 31, fats: 3.6 },
  ],
};

function renderContent(overrides: Partial<Meal> = {}, onBack = jest.fn()) {
  return render(
    <MealDetailsContent
      meal={{ ...meal, ...overrides }}
      onBack={onBack}
    />,
  );
}

describe('MealDetailsContent', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the meal icon, name and, for a meal eaten today, the time', async () => {
    // Arrange & Act
    await renderContent();

    // Assert
    expect(screen.getByText('🍗')).toBeTruthy();
    expect(screen.getByRole('header', { name: 'Jantar' })).toBeTruthy();
    expect(screen.getByText('Hoje, 19h30')).toBeTruthy();
  });

  it('shows the weekday and time for a meal eaten on another day', async () => {
    // Arrange & Act
    await renderContent({ createdAt: '2025-01-13T08:05:00' });

    // Assert
    expect(screen.getByText('Segunda-feira, 08h05')).toBeTruthy();
  });

  it('shows the total calories and macros of the whole meal', async () => {
    // Arrange & Act
    await renderContent();

    // Assert
    expect(screen.getByText('358 kcal')).toBeTruthy();
    expect(screen.getByText('Proteínas')).toBeTruthy();
    expect(screen.getByText('34,5g')).toBeTruthy();
    expect(screen.getByText('Carboidratos')).toBeTruthy();
    expect(screen.getByText('42g')).toBeTruthy();
    expect(screen.getByText('Gorduras')).toBeTruthy();
    expect(screen.getByText('4g')).toBeTruthy();
  });

  it('lists every food with its quantity, calories and macros', async () => {
    // Arrange & Act
    await renderContent();

    // Assert
    expect(screen.getByText('Arroz branco cozido')).toBeTruthy();
    expect(screen.getByText('150g')).toBeTruthy();
    expect(screen.getByText('193 kcal')).toBeTruthy();
    expect(screen.getByText('P 3,5g · C 42g · G 0,4g')).toBeTruthy();

    expect(screen.getByText('Peito de frango grelhado')).toBeTruthy();
    expect(screen.getByText('100g')).toBeTruthy();
    expect(screen.getByText('165 kcal')).toBeTruthy();
    expect(screen.getByText('P 31g · C 0g · G 3,6g')).toBeTruthy();
  });

  it('lets long food names wrap inside their card instead of running off the screen', async () => {
    // Arrange
    const longName = 'Filé de frango grelhado com molho de ervas finas, cogumelos e queijo gratinado';

    // Act
    await renderContent({ foods: [{ ...meal.foods[0], name: longName }] });

    // Assert: the name sits in a flex-1 column (a layout tripwire; real wrapping needs a device to verify).
    expect(screen.getByText(longName).parent?.props.className).toContain('flex-1');
  });

  it('says so when no food was identified, instead of showing an empty list', async () => {
    // Arrange & Act
    await renderContent({ foods: [] });

    // Assert
    expect(screen.getByText('Nenhum alimento foi identificado nesta refeição.')).toBeTruthy();
    expect(screen.getByText('0 kcal')).toBeTruthy();
  });

  it('goes back when the back button is pressed', async () => {
    // Arrange
    const onBack = jest.fn();
    await renderContent({}, onBack);

    // Act
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));

    // Assert
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
