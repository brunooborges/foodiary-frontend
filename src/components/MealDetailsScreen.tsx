import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

import { httpClient } from '../services/httpClient';
import { Meal } from '../types/Meal';
import { getMealRefetchInterval, isMealFinished } from '../utils/mealStatus';
import { Button } from './Button';
import { Logo } from './Logo';
import { MealDetailsContent } from './MealDetailsContent';

interface IMealDetailsScreenProps {
  mealId: string;
}

interface IMealProblemProps {
  title: string;
  description: string;
  onBack: () => void;
  onRetry?: () => void;
}

function MealLoading() {
  return (
    <View
      className='bg-lime-700 flex-1 items-center justify-center gap-12'
      accessible
      accessibilityRole='progressbar'
      accessibilityLabel='Analisando sua refeição'
    >
      <Logo
        width={187}
        height={60}
      />
      <ActivityIndicator color='#fff' />
    </View>
  );
}

function MealProblem({ title, description, onBack, onRetry }: IMealProblemProps) {
  return (
    <View className='flex-1 bg-white items-center justify-center px-8 gap-4'>
      <Text
        className='text-5xl'
        accessible={false}
      >
        🍽️
      </Text>
      <Text className='text-black-700 text-2xl font-sans-semibold text-center'>{title}</Text>
      <Text className='text-gray-700 text-base font-sans-regular text-center'>{description}</Text>

      <View className='mt-4 self-stretch gap-3'>
        {onRetry && <Button onPress={onRetry}>Tentar novamente</Button>}
        <Button
          color={onRetry ? 'gray' : 'default'}
          onPress={onBack}
        >
          Voltar
        </Button>
      </View>
    </View>
  );
}

export function MealDetailsScreen({ mealId }: IMealDetailsScreenProps) {
  const {
    data: meal,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['meal', mealId],
    // A finished meal never changes, but one that was still being analysed when last seen must be refreshed at once.
    staleTime: (query) => (isMealFinished(query.state.data?.status) ? Infinity : 0),
    queryFn: async () => {
      const { data } = await httpClient.get<{ meal: Meal }>(`/meals/${mealId}`);

      return data.meal;
    },
    // Keeps going through a failed attempt while the analysis is unfinished (the next tick may succeed); only gives
    // up when there is nothing to show at all, because then the user can retry with the button.
    refetchInterval: (query) =>
      query.state.status === 'error' && !query.state.data ? false : getMealRefetchInterval(query.state.data?.status),
  });

  const goBack = () => router.back();

  if (meal?.status === 'success') {
    return (
      <MealDetailsContent
        meal={meal}
        onBack={goBack}
      />
    );
  }

  if (meal?.status === 'failed') {
    return (
      <MealProblem
        title='Não foi possível analisar sua refeição'
        description='Tente registrar de novo, de preferência com uma foto mais nítida ou um áudio mais claro.'
        onBack={goBack}
      />
    );
  }

  if (isError) {
    return (
      <MealProblem
        title='Não foi possível carregar a refeição'
        description='Verifique sua conexão e tente de novo.'
        onBack={goBack}
        onRetry={() => refetch()}
      />
    );
  }

  return <MealLoading />;
}
