import { Modal, ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Button } from './Button';

interface IConsentModalProps {
  open: boolean;
  isAccepted: boolean;
  isLoading: boolean;
  errorMessage?: string;
  onAccept: () => void;
  onDecline: () => void;
  onWithdraw: () => void;
}

export function ConsentModal({
  open,
  isAccepted,
  isLoading,
  errorMessage,
  onAccept,
  onDecline,
  onWithdraw,
}: IConsentModalProps) {
  return (
    <Modal
      transparent
      statusBarTranslucent
      visible={open}
      animationType='slide'
      onRequestClose={onDecline}
    >
      <SafeAreaProvider>
        <View className='flex-1 bg-black/60 justify-end'>
          <SafeAreaView className='bg-white rounded-t-3xl max-h-[85%]'>
            <ScrollView contentContainerClassName='p-6 gap-4'>
              <Text
                accessibilityRole='header'
                className='text-black-700 text-2xl font-sans-semibold'
              >
                Antes de continuar
              </Text>

              <Text className='text-gray-700 text-base font-sans-regular'>
                Para identificar os alimentos e calcular calorias e nutrientes, o Foodiary envia as fotos das suas
                refeições e as gravações de voz para serviços de inteligência artificial de terceiros.
              </Text>

              <Text className='text-gray-700 text-base font-sans-regular'>
                • O que é enviado: a foto ou o áudio de cada refeição que você registrar.
              </Text>

              <Text className='text-gray-700 text-base font-sans-regular'>
                • Para que serve: somente para identificar os alimentos e estimar os valores nutricionais.
              </Text>

              <Text className='text-gray-700 text-base font-sans-regular'>
                • Quem recebe: OpenAI ou OpenRouter, conforme o serviço ativo no momento. A OpenRouter pode encaminhar
                o pedido a outros provedores de modelos de IA; nesse caso, solicitamos que apenas provedores que não
                coletam dados processem o pedido.
              </Text>

              <Text className='text-gray-700 text-base font-sans-regular'>
                • Fotos e áudios podem revelar informações sobre a sua saúde. Por isso, só os enviamos com a sua
                concordância.
              </Text>

              <Text className='text-gray-700 text-base font-sans-regular'>
                Você pode retirar o consentimento quando quiser, tocando no ícone de privacidade no topo da tela
                inicial. Sem ele, não é possível registrar refeições por foto ou voz.
              </Text>

              {!!errorMessage && <Text className='text-support-red text-sm font-sans-regular'>{errorMessage}</Text>}

              <View className='gap-3 mt-2'>
                {isAccepted ? (
                  <>
                    <Button
                      color='gray'
                      loading={isLoading}
                      onPress={onWithdraw}
                    >
                      Retirar consentimento
                    </Button>
                    <Button onPress={onDecline}>Fechar</Button>
                  </>
                ) : (
                  <>
                    <Button
                      loading={isLoading}
                      onPress={onAccept}
                    >
                      Concordo
                    </Button>
                    <Button
                      color='gray'
                      disabled={isLoading}
                      onPress={onDecline}
                    >
                      Agora não
                    </Button>
                  </>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </SafeAreaProvider>
    </Modal>
  );
}
