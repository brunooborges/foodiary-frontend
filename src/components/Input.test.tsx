import { fireEvent, render, screen } from '@testing-library/react-native';
import { Keyboard } from 'react-native';

import { Input } from './Input';

describe('Input', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not dismiss the keyboard when the user taps the input', async () => {
    // Arrange
    const dismiss = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => undefined);
    await render(<Input placeholder='E-mail' />);

    // Act
    await fireEvent(screen.getByPlaceholderText('E-mail'), 'pressOut');

    // Assert
    expect(dismiss).not.toHaveBeenCalled();
  });

  it('does not dismiss the keyboard when editing ends, so moving to another input keeps it open', async () => {
    // Arrange
    const dismiss = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => undefined);
    await render(<Input placeholder='E-mail' />);

    // Act
    await fireEvent(screen.getByPlaceholderText('E-mail'), 'endEditing');

    // Assert
    expect(dismiss).not.toHaveBeenCalled();
  });

  it('applies the mask while typing and reports the masked value', async () => {
    // Arrange
    const onChangeText = jest.fn();
    await render(
      <Input
        placeholder='DD/MM/AAAA'
        mask='99/99/9999'
        onChangeText={onChangeText}
      />,
    );

    // Act
    await fireEvent.changeText(screen.getByPlaceholderText('DD/MM/AAAA'), '15052000');

    // Assert
    expect(onChangeText).toHaveBeenCalledWith('15/05/2000');
    expect(screen.getByDisplayValue('15/05/2000')).toBeTruthy();
  });
});
