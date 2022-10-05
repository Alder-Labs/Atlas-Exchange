import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const ENVIRONMENT = process.env.NEXT_PUBLIC_ENV ?? '';

export function useReCaptcha() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  return {
    enabled: ENVIRONMENT !== 'development',
    executeRecaptcha,
  };
}
