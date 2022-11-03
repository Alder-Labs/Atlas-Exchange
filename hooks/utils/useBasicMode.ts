import { useRouter } from 'next/router';

import { ModalState } from '../../lib/types/modalState';
import { useModalState } from '../modal';

export const useBasicMode = () => {
  const router = useRouter();
  const [modalStateDetailed, _] = useModalState();

  const basicMode =
    ['/onboarding/begin', '/onboarding', '/onboarding/signup'].includes(
      router.pathname
    ) ||
    [ModalState.SmsAuth, ModalState.TotpAuth].includes(
      modalStateDetailed.state
    );

  return basicMode;
};
