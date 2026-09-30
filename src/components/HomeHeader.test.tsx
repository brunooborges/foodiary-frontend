import { fireEvent, render, screen } from '@testing-library/react-native';

import { useConsent } from '../hooks/useConsent';
import { HomeHeader } from './HomeHeader';

jest.mock('../hooks/useAuth', () => ({ useAuth: () => ({ user: { name: 'Bruno' }, signOut: jest.fn() }) }));
jest.mock('../hooks/useConsent');

const mockedUseConsent = useConsent as jest.Mock;

function mockConsent({ isAccepted, withdraw = jest.fn().mockResolvedValue(undefined) }: { isAccepted: boolean; withdraw?: jest.Mock }) {
  mockedUseConsent.mockReturnValue({
    isAccepted,
    isLoading: false,
    isSaving: false,
    accept: jest.fn().mockResolvedValue(undefined),
    withdraw,
  });

  return { withdraw };
}

describe('HomeHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('greets the user', async () => {
    // Arrange
    mockConsent({ isAccepted: true });

    // Act
    await render(<HomeHeader />);

    // Assert
    expect(screen.getByText('Bruno')).toBeTruthy();
  });

  it('lets the user review and withdraw their consent at any time', async () => {
    // Arrange
    const { withdraw } = mockConsent({ isAccepted: true });
    await render(<HomeHeader />);

    // Act
    await fireEvent.press(screen.getByLabelText('Privacidade e consentimento'));
    await fireEvent.press(screen.getByText('Retirar consentimento'));

    // Assert
    expect(withdraw).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Antes de continuar')).toBeNull();
  });

  it('keeps the modal open with an error when the withdrawal could not be saved', async () => {
    // Arrange
    mockConsent({ isAccepted: true, withdraw: jest.fn().mockRejectedValue(new Error('network')) });
    await render(<HomeHeader />);
    await fireEvent.press(screen.getByLabelText('Privacidade e consentimento'));

    // Act
    await fireEvent.press(screen.getByText('Retirar consentimento'));

    // Assert
    expect(await screen.findByText('Não foi possível salvar. Tente novamente.')).toBeTruthy();
    expect(screen.getByText('Retirar consentimento')).toBeTruthy();
  });

  it('offers the agreement from the same place when the user has not consented yet', async () => {
    // Arrange
    mockConsent({ isAccepted: false });
    await render(<HomeHeader />);

    // Act
    await fireEvent.press(screen.getByLabelText('Privacidade e consentimento'));

    // Assert
    expect(screen.getByText('Concordo')).toBeTruthy();
    expect(screen.queryByText('Retirar consentimento')).toBeNull();
  });
});
