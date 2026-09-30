import { fireEvent, render, screen } from '@testing-library/react-native';
import { Keyboard, Pressable, Text } from 'react-native';

import { AuthLayout } from './AuthLayout';

describe('AuthLayout', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the title, subtitle and children', async () => {
    // Arrange & Act
    await render(
      <AuthLayout
        icon='📅'
        title='Qual é sua data de nascimento?'
        subtitle='Sua idade ajuda a personalizar sua dieta'
      >
        <Text>conteúdo do passo</Text>
      </AuthLayout>,
    );

    // Assert
    expect(screen.getByText('Qual é sua data de nascimento?')).toBeTruthy();
    expect(screen.getByText('Sua idade ajuda a personalizar sua dieta')).toBeTruthy();
    expect(screen.getByText('conteúdo do passo')).toBeTruthy();
  });

  it('lets a long title and subtitle wrap inside the screen width', async () => {
    // Arrange & Act
    await render(
      <AuthLayout
        icon='🏃'
        title='Qual é seu nível de atividade física?'
        subtitle='Isso nos ajuda a calcular suas necessidades calóricas diárias com precisão'
      />,
    );

    // Assert
    const title = screen.getByText('Qual é seu nível de atividade física?');
    const subtitle = screen.getByText('Isso nos ajuda a calcular suas necessidades calóricas diárias com precisão');
    const textBlock = subtitle.parent;

    expect(title.props.className).toContain('text-center');
    expect(subtitle.props.className).toContain('text-center');
    expect(textBlock?.props.className).toContain('px-6');
    expect(textBlock?.props.className).not.toContain('mx-auto');
  });

  it('dismisses the keyboard when the user taps outside of an input', async () => {
    // Arrange
    const dismiss = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => undefined);
    await render(
      <AuthLayout
        icon='📅'
        title='Qual é sua data de nascimento?'
        subtitle='Sua idade ajuda a personalizar sua dieta'
      />,
    );

    // Act
    await fireEvent.press(screen.getByText('Qual é sua data de nascimento?'));

    // Assert
    expect(dismiss).toHaveBeenCalledTimes(1);
  });

  it('keeps interactive children working without dismissing the keyboard', async () => {
    // Arrange
    const dismiss = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => undefined);
    const onNext = jest.fn();
    await render(
      <AuthLayout
        icon='📅'
        title='Título'
        subtitle='Subtítulo'
      >
        <Pressable onPress={onNext}>
          <Text>Próximo</Text>
        </Pressable>
      </AuthLayout>,
    );

    // Act
    await fireEvent.press(screen.getByText('Próximo'));

    // Assert
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(dismiss).not.toHaveBeenCalled();
  });
});
