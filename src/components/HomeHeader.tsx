import { LogOutIcon, ShieldCheckIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { useConsent } from '../hooks/useConsent';
import { colors } from '../styles/colors';
import { ConsentModal } from './ConsentModal';

const CONSENT_SAVE_ERROR = 'Não foi possível salvar. Tente novamente.';

export function HomeHeader() {
  const { signOut, user } = useAuth();
  const { isAccepted, isSaving, accept, withdraw } = useConsent();

  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [consentError, setConsentError] = useState<string | undefined>();

  function handleCloseConsent() {
    setIsConsentOpen(false);
    setConsentError(undefined);
  }

  async function handleConsentChange(change: () => Promise<unknown>) {
    try {
      await change();
      handleCloseConsent();
    } catch {
      setConsentError(CONSENT_SAVE_ERROR);
    }
  }

  return (
    <View className='bg-lime-400 h-[130px]'>
      <SafeAreaView className='px-4 flex-row items-center justify-between'>
        <View>
          <Text className='text-gray-700 text-sm font-sans-regular'>Olá, 👋</Text>
          <Text className='text-black-700 text-base font-sans-semibold'>{user?.name}</Text>
        </View>

        <View className='flex-row'>
          <TouchableOpacity
            className='size-12 items-center justify-center'
            accessibilityLabel='Privacidade e consentimento'
            onPress={() => setIsConsentOpen(true)}
          >
            <ShieldCheckIcon
              size={20}
              color={colors.black[700]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className='size-12 items-center justify-center'
            accessibilityLabel='Sair'
            onPress={() => signOut()}
          >
            <LogOutIcon
              size={20}
              color={colors.black[700]}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ConsentModal
        open={isConsentOpen}
        isAccepted={isAccepted}
        isLoading={isSaving}
        errorMessage={consentError}
        onAccept={() => handleConsentChange(accept)}
        onDecline={handleCloseConsent}
        onWithdraw={() => handleConsentChange(withdraw)}
      />
    </View>
  );
}
