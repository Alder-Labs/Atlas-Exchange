import React, { useEffect } from "react";

import { useAtom } from "jotai";
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from "react-google-recaptcha-v3";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";

import { useModalState } from "../../../hooks/useModalState";
import { requireEnvVar } from "../../../lib/env";
import { sardineDeviceIdAtom } from "../../../lib/jotai";
import { useMutationFetcher } from "../../../lib/mutation";
import { toast } from "../../../lib/toast";
import { ModalState } from "../../../lib/types/modalState";
import { TextInput, Button, Text } from "../../base";
import { TitledModal } from "../../modals/TitledModal";

const FTX_RECAPTCHA_CHANGE_PASSWORD_ACTION = "CHANGEPASSWORD";
const RECAPTCHA_KEY = requireEnvVar("NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY");

type PublicResetPasswordRequest = {
  deviceId?: string | null;
  email: string;
  captcha: {
    recaptcha_challenge: string;
  };
};

type ForgotPasswordForm = {
  email: string;
};

const ForgotPasswordModal = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [sardineDeviceId] = useAtom(sardineDeviceIdAtom);
  const [modalState, setModalState, handlers] = useModalState();

  const {
    watch,
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    defaultValues: {
      email: "",
    },
  });

  const {
    isLoading: requestPasswordResetIsLoading,
    mutate: requestPasswordReset,
  } = useMutation(
    useMutationFetcher<PublicResetPasswordRequest, {}>(
      `/proxy/api/users/public_change_password`
    ),
    {
      onSuccess: (data) => {
        toast.success("Reset password email sent.");
      },
      onError: (error) => {
        toast.error(`Error resetting password. Please contact support.`);
      },
    }
  );

  useEffect(() => {
    reset();
  }, [reset]);

  const onResetPassword = async (data: ForgotPasswordForm) => {
    if (!executeRecaptcha) {
      toast.error("Error: reCAPTCHA not loaded.");
      return;
    }

    let captchaToken: string;
    try {
      captchaToken = await executeRecaptcha(
        FTX_RECAPTCHA_CHANGE_PASSWORD_ACTION
      );
    } catch (e) {
      toast.error("Error: reCAPTCHA failed. Please contact Support.");
      return;
    }

    requestPasswordReset({
      deviceId: sardineDeviceId,
      email: data.email,
      captcha: {
        recaptcha_challenge: captchaToken,
      },
    });
  };

  return (
    <TitledModal
      title={"Forgot Password"}
      darkenBackground={false}
      isOpen={modalState.state === ModalState.ForgotPassword}
      onClose={() => setModalState({ state: ModalState.Closed })}
      renderWhenClosed={modalState.state === ModalState.Closed}
      onGoBack={handlers.goBack}
    >
      <form onSubmit={handleSubmit(onResetPassword)}>
        <div className="px-4 pb-6">
          <div className="h-6" />
          <Text color={"secondary"}>
            Please confirm you&apos;re using the official site.
          </Text>
          <div className="h-6" />
          <TextInput
            placeholder="Email"
            label={"Email"}
            {...register("email", { required: true })}
          />
          <div className="h-6" />
          <Button
            type="submit"
            className="w-full"
            loading={requestPasswordResetIsLoading}
            disabled={watch("email").length === 0}
          >
            Reset Password
          </Button>
        </div>
      </form>
    </TitledModal>
  );
};

const RecaptchaForgotPasswordWrapper = () => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_KEY}>
      <ForgotPasswordModal />
    </GoogleReCaptchaProvider>
  );
};

export default RecaptchaForgotPasswordWrapper;
