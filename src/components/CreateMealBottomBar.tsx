import { CameraIcon, MicIcon } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConsent } from '../hooks/useConsent';
import { AudioModal } from './AudioModal';
import { Button } from './Button';
import { CameraModal } from './CameraModal';
import { ConsentModal } from './ConsentModal';

type CaptureKind = 'audio' | 'picture';

const CONSENT_SAVE_ERROR = 'Não foi possível salvar. Tente novamente.';

export function CreateMealBottomBar() {
  const { bottom } = useSafeAreaInsets();
  const { isAccepted, isLoading, isSaving, accept } = useConsent();

  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isPictureModalOpen, setIsPictureModalOpen] = useState(false);
  const [pendingCapture, setPendingCapture] = useState<CaptureKind | null>(null);
  const [consentError, setConsentError] = useState<string | undefined>();

  function openCapture(kind: CaptureKind) {
    if (kind === 'audio') {
      setIsAudioModalOpen(true);
      return;
    }

    setIsPictureModalOpen(true);
  }

  // Photos and voice notes are sent to third-party AI services, so nothing is captured before the user agrees.
  function handleCaptureRequest(kind: CaptureKind) {
    if (isAccepted) {
      openCapture(kind);
      return;
    }

    setPendingCapture(kind);
  }

  function handleCloseConsent() {
    setPendingCapture(null);
    setConsentError(undefined);
  }

  async function handleAcceptConsent() {
    const requestedCapture = pendingCapture;

    try {
      await accept();
    } catch {
      setConsentError(CONSENT_SAVE_ERROR);
      return;
    }

    handleCloseConsent();

    if (requestedCapture) {
      openCapture(requestedCapture);
    }
  }

  return (
    <View
      className='absolute bg-white z-10 w-full bottom-0 border-t border-gray-400'
      style={{ height: 80 + bottom }}
    >
      <View className='flex-row mx-auto gap-4 mt-4'>
        <Button
          size='icon'
          color='gray'
          disabled={isLoading}
          accessibilityLabel='Registrar refeição por voz'
          onPress={() => handleCaptureRequest('audio')}
        >
          <MicIcon />
        </Button>

        <Button
          size='icon'
          color='gray'
          disabled={isLoading}
          accessibilityLabel='Registrar refeição por foto'
          onPress={() => handleCaptureRequest('picture')}
        >
          <CameraIcon />
        </Button>
      </View>

      <AudioModal
        open={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
      />
      <CameraModal
        open={isPictureModalOpen}
        onClose={() => setIsPictureModalOpen(false)}
      />
      {/* Only used to ask for consent here; reviewing or withdrawing it lives in the home header. */}
      <ConsentModal
        open={pendingCapture !== null}
        isAccepted={false}
        isLoading={isSaving}
        errorMessage={consentError}
        onAccept={handleAcceptConsent}
        onDecline={handleCloseConsent}
        onWithdraw={handleCloseConsent}
      />
    </View>
  );
}
