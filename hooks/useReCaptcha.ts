import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export function useReCaptcha() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  return {
    executeRecaptcha,
  };
}
