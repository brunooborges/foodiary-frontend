import { formatCalories, formatGrams, sumNutrition } from './mealNutrition';

const rice = { name: 'Arroz', quantity: '150g', calories: 193, carbohydrates: 42, proteins: 3.5, fats: 0.4 };
const chicken = { name: 'Frango', quantity: '100g', calories: 165, carbohydrates: 0, proteins: 31, fats: 3.6 };

describe('sumNutrition', () => {
  it('adds up calories and macros of every food', () => {
    // Act
    const totals = sumNutrition([rice, chicken]);

    // Assert
    expect(totals.calories).toBe(358);
    expect(totals.carbohydrates).toBe(42);
    expect(totals.proteins).toBeCloseTo(34.5);
    expect(totals.fats).toBeCloseTo(4);
  });

  it('returns zeros when no food was identified', () => {
    expect(sumNutrition([])).toEqual({ calories: 0, carbohydrates: 0, proteins: 0, fats: 0 });
  });

  it('does not change the foods it receives', () => {
    // Arrange
    const foods = [rice, chicken];
    const copy = JSON.parse(JSON.stringify(foods));

    // Act
    sumNutrition(foods);

    // Assert
    expect(foods).toEqual(copy);
  });
});

describe('formatGrams', () => {
  it('uses the Brazilian decimal comma with at most one decimal place', () => {
    expect(formatGrams(3.5)).toBe('3,5g');
    expect(formatGrams(0.4)).toBe('0,4g');
    expect(formatGrams(34.46)).toBe('34,5g');
  });

  it('omits the decimals of whole numbers', () => {
    expect(formatGrams(42)).toBe('42g');
    expect(formatGrams(0)).toBe('0g');
    expect(formatGrams(4.02)).toBe('4g');
  });
});

describe('formatCalories', () => {
  it('rounds to whole calories', () => {
    expect(formatCalories(357.6)).toBe('358');
    expect(formatCalories(0)).toBe('0');
  });

  it('groups thousands the Brazilian way', () => {
    expect(formatCalories(1234.4)).toBe('1.234');
  });
});
