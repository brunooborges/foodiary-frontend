import { MealFood } from '../types/Meal';

export type NutritionTotals = Pick<MealFood, 'calories' | 'carbohydrates' | 'proteins' | 'fats'>;

const EMPTY_TOTALS: NutritionTotals = { calories: 0, carbohydrates: 0, proteins: 0, fats: 0 };

export function sumNutrition(foods: readonly MealFood[]): NutritionTotals {
  return foods.reduce<NutritionTotals>(
    (totals, food) => ({
      calories: totals.calories + food.calories,
      carbohydrates: totals.carbohydrates + food.carbohydrates,
      proteins: totals.proteins + food.proteins,
      fats: totals.fats + food.fats,
    }),
    EMPTY_TOTALS,
  );
}

const gramsFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
const caloriesFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

export function formatGrams(value: number): string {
  return `${gramsFormat.format(value)}g`;
}

export function formatCalories(value: number): string {
  return caloriesFormat.format(value);
}
