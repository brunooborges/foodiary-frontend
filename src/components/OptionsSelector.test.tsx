import { fireEvent, render, screen } from '@testing-library/react-native';

import { OptionsSelector } from './OptionsSelector';

const options = [
  { value: 'lose', icon: '🔥', title: 'Perder peso' },
  { value: 'maintain', icon: '⚖️', title: 'Manter peso' },
  { value: 'gain', icon: '💪', title: 'Ganhar massa' },
];

describe('OptionsSelector', () => {
  it('marks only the selected option as checked', async () => {
    // Arrange & Act
    await render(
      <OptionsSelector
        options={options}
        value='maintain'
      />,
    );

    // Assert
    expect(screen.getByRole('radio', { name: /Manter peso/, checked: true })).toBeTruthy();
    expect(screen.getByRole('radio', { name: /Perder peso/, checked: false })).toBeTruthy();
    expect(screen.getByRole('radio', { name: /Ganhar massa/, checked: false })).toBeTruthy();
  });

  it('moves the checked state when the value changes', async () => {
    // Arrange
    const { rerender } = await render(
      <OptionsSelector
        options={options}
        value='lose'
      />,
    );

    // Act
    await rerender(
      <OptionsSelector
        options={options}
        value='gain'
      />,
    );

    // Assert
    expect(screen.getByRole('radio', { name: /Ganhar massa/, checked: true })).toBeTruthy();
    expect(screen.getByRole('radio', { name: /Perder peso/, checked: false })).toBeTruthy();
  });

  it('lets a long description wrap inside the option border', async () => {
    // Arrange & Act
    await render(
      <OptionsSelector
        options={[
          {
            value: 'active',
            icon: '🏃',
            title: 'Muito ativo',
            description: 'Exercício intenso 6 a 7 dias por semana, além de trabalho físico',
          },
        ]}
      />,
    );

    // Assert
    const description = screen.getByText('Exercício intenso 6 a 7 dias por semana, além de trabalho físico');

    expect(description.parent?.props.className).toContain('flex-1');
  });

  it('calls onChange with the value of the pressed option', async () => {
    // Arrange
    const onChange = jest.fn();
    await render(
      <OptionsSelector
        options={options}
        onChange={onChange}
      />,
    );

    // Act
    await fireEvent.press(screen.getByRole('radio', { name: /Ganhar massa/ }));

    // Assert
    expect(onChange).toHaveBeenCalledWith('gain');
  });
});
