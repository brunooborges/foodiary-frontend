import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { useConsent } from '../hooks/useConsent';
import { CreateMealBottomBar } from './CreateMealBottomBar';

// The real capture modals need the camera and microphone; these stubs only report whether they were opened.
// (Referenced lazily from the factories below, which Jest allows for `mock`-prefixed names.)
function mockStub(label: string, open: boolean) {
  return open ? <Text>{label}</Text> : null;
}

jest.mock('../hooks/useConsent');
jest.mock('./AudioModal', () => ({
  AudioModal: ({ open }: { open: boolean }) => mockStub('audio-modal-open', open),
}));
jest.mock('./CameraModal', () => ({
  CameraModal: ({ open }: { open: boolean }) => mockStub('camera-modal-open', open),
}));

const mockedUseConsent = useConsent as jest.Mock;

function mockConsent({
  isAccepted,
  isLoading = false,
  accept = jest.fn().mockResolvedValue(undefined),
}: {
  isAccepted: boolean;
  isLoading?: boolean;
  accept?: jest.Mock;
}) {
  mockedUseConsent.mockReturnValue({
    isAccepted,
    isLoading,
    isSaving: false,
    accept,
    withdraw: jest.fn(),
  });

  return { accept };
}

describe('CreateMealBottomBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when the user has already consented', () => {
    it('opens the voice recorder straight away', async () => {
      // Arrange
      mockConsent({ isAccepted: true });
      await render(<CreateMealBottomBar />);

      // Act
      await fireEvent.press(screen.getByLabelText('Registrar refeição por voz'));

      // Assert
      expect(screen.getByText('audio-modal-open')).toBeTruthy();
      expect(screen.queryByText('Antes de continuar')).toBeNull();
    });

    it('opens the camera straight away', async () => {
      // Arrange
      mockConsent({ isAccepted: true });
      await render(<CreateMealBottomBar />);

      // Act
      await fireEvent.press(screen.getByLabelText('Registrar refeição por foto'));

      // Assert
      expect(screen.getByText('camera-modal-open')).toBeTruthy();
    });
  });

  describe('while the consent status is still loading', () => {
    it('does nothing when a button is tapped, instead of asking a user who may already have consented', async () => {
      // Arrange
      mockConsent({ isAccepted: false, isLoading: true });
      await render(<CreateMealBottomBar />);

      // Act
      await fireEvent.press(screen.getByLabelText('Registrar refeição por voz'));
      await fireEvent.press(screen.getByLabelText('Registrar refeição por foto'));

      // Assert
      expect(screen.queryByText('Antes de continuar')).toBeNull();
      expect(screen.queryByText('audio-modal-open')).toBeNull();
      expect(screen.queryByText('camera-modal-open')).toBeNull();
    });
  });

  describe('when the user has not consented', () => {
    it('asks for consent instead of opening the recorder', async () => {
      // Arrange
      mockConsent({ isAccepted: false });
      await render(<CreateMealBottomBar />);

      // Act
      await fireEvent.press(screen.getByLabelText('Registrar refeição por voz'));

      // Assert
      expect(screen.getByText('Antes de continuar')).toBeTruthy();
      expect(screen.queryByText('audio-modal-open')).toBeNull();
    });

    it('opens the camera the user asked for once they agree', async () => {
      // Arrange
      const { accept } = mockConsent({ isAccepted: false });
      await render(<CreateMealBottomBar />);
      await fireEvent.press(screen.getByLabelText('Registrar refeição por foto'));

      // Act
      await fireEvent.press(screen.getByText('Concordo'));

      // Assert
      expect(accept).toHaveBeenCalledTimes(1);
      expect(await screen.findByText('camera-modal-open')).toBeTruthy();
      expect(screen.queryByText('audio-modal-open')).toBeNull();
      expect(screen.queryByText('Antes de continuar')).toBeNull();
    });

    it('opens nothing when the user declines', async () => {
      // Arrange
      const { accept } = mockConsent({ isAccepted: false });
      await render(<CreateMealBottomBar />);
      await fireEvent.press(screen.getByLabelText('Registrar refeição por voz'));

      // Act
      await fireEvent.press(screen.getByText('Agora não'));

      // Assert
      expect(accept).not.toHaveBeenCalled();
      expect(screen.queryByText('Antes de continuar')).toBeNull();
      expect(screen.queryByText('audio-modal-open')).toBeNull();
    });

    it('keeps the consent open with an error when it could not be saved, and opens nothing', async () => {
      // Arrange
      const accept = jest.fn().mockRejectedValue(new Error('network'));
      mockConsent({ isAccepted: false, accept });
      await render(<CreateMealBottomBar />);
      await fireEvent.press(screen.getByLabelText('Registrar refeição por voz'));

      // Act
      await fireEvent.press(screen.getByText('Concordo'));

      // Assert
      expect(await screen.findByText('Não foi possível salvar. Tente novamente.')).toBeTruthy();
      expect(screen.queryByText('audio-modal-open')).toBeNull();
    });
  });
});
