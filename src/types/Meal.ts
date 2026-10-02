export type MealStatus = 'uploading' | 'processing' | 'success' | 'failed';

export type MealFood = {
  name: string;
  quantity: string;
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
};

export type Meal = {
  id: string;
  createdAt: string;
  icon: string;
  name: string;
  status: MealStatus;
  foods: MealFood[];
};
