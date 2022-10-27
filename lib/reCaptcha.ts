import { RecaptchaActions } from './types';

export async function getReCaptchaTokenOrError({
  executeRecaptcha,
  reCaptchaAction,
}: {
  executeRecaptcha:
    | ((action?: string | undefined) => Promise<string>)
    | undefined;
  reCaptchaAction: RecaptchaActions;
}): Promise<{ ok: true; token: string } | { ok: false; errors: string[] }> {
  let captchaToken;
  const errors: string[] = [];

  if (executeRecaptcha) {
    try {
      captchaToken = await executeRecaptcha(reCaptchaAction);
    } catch (e) {
      errors.push('executeRecaptcha failed');
    }
  } else {
    errors.push('executeRecaptcha not loaded');
  }

  if (!captchaToken) {
    errors.push('executeRecaptcha returned undefined');
  }

  return errors.length === 0
    ? { ok: true, token: captchaToken as string }
    : { ok: false, errors };
}
