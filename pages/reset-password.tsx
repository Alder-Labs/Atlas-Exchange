import React, { useEffect, useState } from 'react';

import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAtom } from 'jotai';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useMutation } from 'react-query';

import { Button, TextButton, TextInput, Text } from '../components/base';
import { PasswordRequirements } from '../components/global-modals/authentication/SignUp';
import { SidePadding } from '../components/layout/SidePadding';
import { useUserState } from '../lib/auth-token-context';
import { sardineDeviceIdAtom } from '../lib/jotai';
import { useMutationFetcher } from '../lib/mutation';

type PasswordResetForm = {
  code: string;
  newPassword: string;
  newPasswordConfirm: string;
  currentEmail?: string;
};

type PasswordResetFormRequest = {
  code: string;
  password: string;
  deviceId: string;
  email?: string;
};

type PasswordResetFormResponse = {
  success: boolean;
};

const ResetPasswordPage: NextPage = (props: {}) => {
  const router = useRouter();
  const [newPasswordIsShowing, setNewPasswordIsShowing] = useState(false);
  const [newPasswordConfirmIsShowing, setNewPasswordConfirmIsShowing] =
    useState(false);

  const userState = useUserState();
  const loggedIn = !!userState.user;

  const [sardineDeviceId] = useAtom(sardineDeviceIdAtom);

  const { code } = router.query;

  const {
    watch,
    register,
    reset,
    handleSubmit,
    setError,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<PasswordResetForm>({
    defaultValues: {
      newPassword: '',
      newPasswordConfirm: '',
      code: '',
      currentEmail: '',
    },
  });

  // Update code on page render
  useEffect(() => {
    setValue('code', (code as string) || '000000');
  }, [code, setValue]);

  const { isLoading: fetchResetPasswordIsLoading, mutate: fetchResetPassword } =
    useMutation(
      useMutationFetcher<PasswordResetFormRequest, PasswordResetFormResponse>(
        '/proxy/api/users/complete_authenticated_password_reset'
      ),
      {
        onSuccess: (data) => {
          toast.success('Password reset successfully');
          if (userState.user) userState.signout();
        },
        onError: (err: Error) => {
          toast.error(`Error: ${err.message}`);
        },
      }
    );

  // Clear all fields on state change
  useEffect(() => {
    reset();
    setNewPasswordIsShowing(false);
    setNewPasswordConfirmIsShowing(false);
  }, [reset]);

  const resetPassword = (data: PasswordResetForm) => {
    if (data.newPassword !== data.newPasswordConfirm) {
      setError(
        'newPasswordConfirm',
        { type: 'validate' },
        { shouldFocus: true }
      );
      return;
    }

    if (!data.code || data.code.length < 4) {
      setError('code', { type: 'validate' }, { shouldFocus: true });
      return;
    }

    if (!sardineDeviceId) {
      toast.error('Device ID not found, please contact support.');
      return;
    }

    fetchResetPassword({
      code: data.code,
      password: data.newPassword,
      deviceId: sardineDeviceId,
      email: data.currentEmail,
    });
  };

  if (code && typeof code !== 'string') {
    return <div>Invalid code</div>;
  }

  function renderConfirmPasswordValidation() {
    return (
      <>
        {watch('newPasswordConfirm') &&
          (watch('newPasswordConfirm') !== watch('newPassword') ? (
            <div className="mt-3 animate-enter">
              <Text color="red" size="sm">
                Passwords do not match
              </Text>
            </div>
          ) : watch('newPasswordConfirm') === watch('newPassword') ? (
            <div className="mt-3 animate-enter">
              <Text color="green" size="sm">
                Passwords match
              </Text>
            </div>
          ) : null)}
      </>
    );
  }

  function renderNewPasswordValidation() {
    return (
      <>
        {watch('newPassword') && (
          <div className="mt-3 animate-enter">
            <PasswordRequirements password={watch('newPassword')} />
          </div>
        )}
      </>
    );
  }

  return (
    <SidePadding className="flex bg-grayLight-10 dark:bg-black">
      <div className="h-8 sm:h-24"></div>

      <div className="mx-auto max-h-[95vh] w-full max-w-md">
        <div className="box-border w-full rounded-md bg-white text-white shadow-md dark:bg-grayDark-20">
          <div className="flex w-full justify-center border-b border-grayLight-40 p-4 dark:border-grayDark-40">
            <Text size="lg">Reset Password</Text>
          </div>
          <div className="flex items-baseline justify-center gap-2 border-grayLight-40 p-4 pb-4 dark:border-grayDark-40">
            <form
              onSubmit={handleSubmit(resetPassword)}
              className="mx-auto w-full"
            >
              {!loggedIn && (
                <>
                  <TextInput
                    label="Current Email"
                    placeholder={'Current Email'}
                    type="text"
                    {...register('currentEmail', { required: !loggedIn })}
                  />
                  <div className="h-6"></div>
                </>
              )}
              <TextInput
                label="New Password"
                placeholder={'New Password'}
                type={newPasswordIsShowing ? 'text' : 'password'}
                id={'inline-new-password'}
                renderSuffix={() => (
                  <TextButton
                    onClick={() => setNewPasswordIsShowing((p) => !p)}
                    className="mx-3 duration-300 ease-in"
                    size="md"
                    type="button"
                    variant="secondary"
                  >
                    <FontAwesomeIcon
                      icon={newPasswordIsShowing ? faEye : faEyeSlash}
                      className="h-4 w-4"
                    />
                  </TextButton>
                )}
                {...register('newPassword', { required: true })}
              />
              {renderNewPasswordValidation()}
              <div className="h-6"></div>
              <TextInput
                label="Confirm Password"
                placeholder={'Confirm Password'}
                type={newPasswordConfirmIsShowing ? 'text' : 'password'}
                id={'inline-confirm-new-password'}
                renderSuffix={() => (
                  <TextButton
                    onClick={() => setNewPasswordConfirmIsShowing((p) => !p)}
                    className="mx-3 duration-300 ease-in"
                    size="md"
                    type="button"
                    variant="secondary"
                  >
                    <FontAwesomeIcon
                      icon={newPasswordConfirmIsShowing ? faEye : faEyeSlash}
                      className="h-4 w-4"
                    />
                  </TextButton>
                )}
                {...register('newPasswordConfirm', { required: true })}
              />
              {renderConfirmPasswordValidation()}
              <div className="h-6"></div>
              <TextInput
                label="Code"
                placeholder={'000000'}
                type="text"
                {...register('code', { required: true })}
              />
              {errors.code && (
                <div className="text-sm text-redLight dark:text-redDark">
                  {errors.code.type === 'required'
                    ? 'Code is required'
                    : 'Invalid code'}
                </div>
              )}
              <div className="h-8"></div>
              <Button
                type="submit"
                className="w-full"
                loading={fetchResetPasswordIsLoading}
                disabled={
                  (!loggedIn && !!getValues('currentEmail')) ||
                  watch('newPassword').length === 0 ||
                  watch('newPasswordConfirm').length === 0 ||
                  watch('code').length === 0
                }
              >
                Reset Password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </SidePadding>
  );
};

export default ResetPasswordPage;
