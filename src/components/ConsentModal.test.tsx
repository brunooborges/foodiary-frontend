import { fireEvent, render, screen } from '@testing-library/react-native';

import { ConsentModal } from './ConsentModal';

async function renderModal(props: Partial<React.ComponentProps<typeof ConsentModal>> = {}) {
  const handlers = { onAccept: jest.fn(), onDecline: jest.fn(), onWithdraw: jest.fn() };

  await render(
    <ConsentModal
      open
      isAccepted={false}
      isLoading={false}
      {...handlers}
      {...props}
    />,
  );

  return handlers;
}

describe('ConsentModal', () => {
  it('explains what is sent, to whom and why, before asking for agreement', async () => {
    // Arrange & Act
    await renderModal();

    // Assert
    expect(screen.getByText('Antes de continuar')).toBeTruthy();
    expect(screen.getByText(/fotos das suas refeições e as gravações de voz/)).toBeTruthy();
    expect(screen.getByText(/OpenAI/)).toBeTruthy();
    expect(screen.getByText(/OpenRouter/)).toBeTruthy();
  });

  it('announces its title as a heading to screen readers', async () => {
    // Arrange & Act
    await renderModal();

    // Assert
    expect(screen.getByRole('header', { name: 'Antes de continuar' })).toBeTruthy();
  });

  it('lets the user agree', async () => {
    // Arrange
    const { onAccept } = await renderModal();

    // Act
    await fireEvent.press(screen.getByText('Concordo'));

    // Assert
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('lets the user decline without any consequence other than not recording meals', async () => {
    // Arrange
    const { onDecline, onAccept } = await renderModal();

    // Act
    await fireEvent.press(screen.getByText('Agora não'));

    // Assert
    expect(onDecline).toHaveBeenCalledTimes(1);
    expect(onAccept).not.toHaveBeenCalled();
  });

  it('shows the withdrawal option, and no agree button, once the user has consented', async () => {
    // Arrange
    const { onWithdraw } = await renderModal({ isAccepted: true });

    // Assert
    expect(screen.queryByText('Concordo')).toBeNull();

    // Act
    await fireEvent.press(screen.getByText('Retirar consentimento'));

    // Assert
    expect(onWithdraw).toHaveBeenCalledTimes(1);
  });

  it('shows an error when the agreement could not be saved', async () => {
    // Arrange & Act
    await renderModal({ errorMessage: 'Não foi possível salvar. Tente novamente.' });

    // Assert
    expect(screen.getByText('Não foi possível salvar. Tente novamente.')).toBeTruthy();
  });

  it('renders nothing when closed', async () => {
    // Arrange & Act
    await renderModal({ open: false });

    // Assert
    expect(screen.queryByText('Antes de continuar')).toBeNull();
  });
});
