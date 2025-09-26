import { Controller, useFormContext } from 'react-hook-form';
import { OptionsSelector } from '../OptionsSelector';
import { SignUpFormData } from './signUpSchema';

export function GoalStep() {
  const { control } = useFormContext<SignUpFormData>();

  return (
    <Controller
      control={control}
      name='goal'
      render={({ field: { onChange, value } }) => (
        <OptionsSelector
          value={value}
          onChange={onChange}
          options={[
            {
              icon: '🥦',
              title: 'Perder peso',
              value: 'lose',
            },
            {
              icon: '🍍',
              title: 'Manter o peso',
              value: 'maintain',
            },
            {
              icon: '🥩',
              title: 'Ganhar peso',
              value: 'gain',
            },
          ]}
        />
      )}
    />
  );
}
