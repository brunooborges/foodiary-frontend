import { useLocalSearchParams } from 'expo-router';

import { MealDetailsScreen } from '../../../components/MealDetailsScreen';

export default function MealDetails() {
  const { mealId } = useLocalSearchParams<{ mealId: string }>();

  return <MealDetailsScreen mealId={mealId} />;
}
