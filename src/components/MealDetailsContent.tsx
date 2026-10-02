import { ArrowLeftIcon } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../styles/colors';
import { Meal, MealFood } from '../types/Meal';
import { formatMealDate } from '../utils/formatMealDate';
import { formatCalories, formatGrams, NutritionTotals, sumNutrition } from '../utils/mealNutrition';

interface IMealDetailsContentProps {
  meal: Meal;
  onBack: () => void;
}

interface IMacroProps {
  label: string;
  value: string;
  className: string;
}

function Macro({ label, value, className }: IMacroProps) {
  return (
    <View className='items-center flex-1'>
      <Text className={`font-sans-bold text-base ${className}`}>{value}</Text>
      <Text className='text-sm text-gray-700 font-sans-regular'>{label}</Text>
    </View>
  );
}

function MealTotals({ totals }: { totals: NutritionTotals }) {
  return (
    <View className='mx-6 -mt-8 bg-white border border-gray-400 rounded-2xl p-5'>
      <Text className='text-center text-sm text-gray-700 font-sans-regular'>Total da refeição</Text>
      <Text className='text-center text-3xl text-support-tomato font-sans-bold mt-1'>
        {`${formatCalories(totals.calories)} kcal`}
      </Text>

      <View className='flex-row mt-5'>
        <Macro
          label='Proteínas'
          value={formatGrams(totals.proteins)}
          className='text-support-teal'
        />
        <Macro
          label='Carboidratos'
          value={formatGrams(totals.carbohydrates)}
          className='text-support-yellow'
        />
        <Macro
          label='Gorduras'
          value={formatGrams(totals.fats)}
          className='text-support-orange'
        />
      </View>
    </View>
  );
}

function FoodCard({ food }: { food: MealFood }) {
  return (
    <View className='mx-6 mb-3 p-4 border border-gray-400 rounded-2xl'>
      <View className='flex-row items-start justify-between gap-3'>
        <View className='flex-1'>
          <Text className='text-base text-black-700 font-sans-medium'>{food.name}</Text>
          <Text className='text-sm text-gray-700 font-sans-regular'>{food.quantity}</Text>
        </View>

        <Text className='text-base text-support-tomato font-sans-semibold'>
          {`${formatCalories(food.calories)} kcal`}
        </Text>
      </View>

      <Text className='mt-3 text-sm text-gray-700 font-sans-regular'>
        {`P ${formatGrams(food.proteins)} · C ${formatGrams(food.carbohydrates)} · G ${formatGrams(food.fats)}`}
      </Text>
    </View>
  );
}

export function MealDetailsContent({ meal, onBack }: IMealDetailsContentProps) {
  const totals = sumNutrition(meal.foods);

  return (
    <View className='flex-1 bg-white'>
      <View className='bg-lime-400'>
        <SafeAreaView edges={['top']}>
          <TouchableOpacity
            className='size-12 items-center justify-center ml-2'
            accessibilityRole='button'
            accessibilityLabel='Voltar'
            onPress={onBack}
          >
            <ArrowLeftIcon
              size={20}
              color={colors.black[700]}
            />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerClassName='pb-12'>
        <View className='bg-lime-400 px-6 pt-2 pb-14 rounded-b-[32px] flex-row items-center gap-4'>
          <View className='size-16 bg-white rounded-2xl items-center justify-center'>
            <Text className='text-3xl'>{meal.icon}</Text>
          </View>

          <View className='flex-1'>
            <Text
              accessibilityRole='header'
              className='text-black-700 text-2xl font-sans-semibold'
            >
              {meal.name}
            </Text>
            <Text className='text-gray-700 text-base font-sans-regular'>
              {formatMealDate(new Date(meal.createdAt))}
            </Text>
          </View>
        </View>

        <MealTotals totals={totals} />

        <Text className='text-black-700 mx-6 mt-8 mb-3 text-base font-sans-medium tracking-[1.28px]'>ALIMENTOS</Text>

        {meal.foods.length === 0 ? (
          <Text className='mx-6 text-base text-gray-700 font-sans-regular'>
            Nenhum alimento foi identificado nesta refeição.
          </Text>
        ) : (
          meal.foods.map((food, index) => (
            <FoodCard
              key={`${food.name}-${index}`}
              food={food}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
