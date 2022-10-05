import React, { useState, useEffect } from "react";

import {
  faCheckCircle,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from "react-google-recaptcha-v3";
import { useForm } from "react-hook-form";

import { useModalState } from "../../../hooks/useModalState";
import { useUserState, SignupParams } from "../../../lib/auth-token-context";
import { requireEnvVar } from "../../../lib/env";
import { toast } from "../../../lib/toast";
import { ModalState } from "../../../lib/types/modalState";
import { TextInput, TextButton, InputCheckbox, Button, Text } from "../../base";
import { TitledModal } from "../../modals/TitledModal";

const FTX_RECAPTCHA_CREATE_USER_ACTION = "REGISTER";
const RECAPTCHA_KEY = requireEnvVar("NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY");

function validatePassword(password: string) {
  const noSpaces = !/\s/.test(password);
  const atLeast8Chars = password.length >= 8;
  const hasLowerAndUpper =
    !!password.match(/[a-z]/) && !!password.match(/[A-Z]/);
  const hasNumber = !!password.match(/[0-9]/);
  const hasSpecialChar = !!password.match(/[!@#$%^&*]/);

  const isValid =
    noSpaces &&
    atLeast8Chars &&
    hasLowerAndUpper &&
    hasNumber &&
    hasSpecialChar;

  return {
    noSpaces,
    atLeast8Chars,
    hasLowerAndUpper,
    hasNumber,
    hasSpecialChar,
    isValid,
  } as const;
}

function PasswordRequirement({
  satisfied,
  errorMessage,
}: {
  satisfied: boolean;
  errorMessage: string;
}) {
  return (
    <div className="flex items-center">
      {satisfied ? (
        <Text color="green">
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="mr-2 h-4 w-4 text-green-500"
          />
        </Text>
      ) : (
        <Text color="secondary">
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="mr-2 h-4 w-4 text-red-500"
          />
        </Text>
      )}
      <Text size="sm" color={satisfied ? "normal" : "secondary"}>
        {errorMessage}
      </Text>
    </div>
  );
}

export function PasswordRequirements({ password }: { password: string }) {
  const {
    noSpaces,
    atLeast8Chars,
    hasLowerAndUpper,
    hasNumber,
    hasSpecialChar,
  } = validatePassword(password);

  return (
    <div className="flex flex-col items-start gap-1">
      <PasswordRequirement
        satisfied={noSpaces}
        errorMessage="Must contain spaces"
      />
      <PasswordRequirement
        satisfied={atLeast8Chars}
        errorMessage="Must be at least 8 characters long"
      />
      <PasswordRequirement
        satisfied={hasLowerAndUpper}
        errorMessage="Must have at least one lowercase and one uppercase letter"
      />
      <PasswordRequirement
        satisfied={hasNumber}
        errorMessage="Must have at least one number"
      />
      <PasswordRequirement
        satisfied={hasSpecialChar}
        errorMessage="Must have at least one special character"
      />
    </div>
  );
}

interface SignUpProps {}

const SignUpModal = (props: SignUpProps) => {
  const router = useRouter();
  const userState = useUserState();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [modalState, setModalState] = useModalState();

  const [agreed, setAgreed] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const {
    watch,
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupParams>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Clear all fields on state change
  useEffect(() => {
    reset();
    setAgreed(false);
  }, [modalState, reset]);

  const onSignUp = async (data: Omit<SignupParams, "captcha">) => {
    if (!agreed) {
      toast.error("You must agree to the terms and conditions");
      return;
    }

    const password: string = data.password;
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    const isValid = validatePassword(password).isValid;
    if (!isValid) {
      toast.error("Invalid password");
      return;
    }

    if (!executeRecaptcha) {
      toast.error("Error: reCAPTCHA not loaded.");
      return;
    }

    let captchaToken: string;
    try {
      captchaToken = await executeRecaptcha(FTX_RECAPTCHA_CREATE_USER_ACTION);
    } catch (e) {
      toast.error("Error: reCAPTCHA failed. Please contact Support.");
      return;
    }

    if (!userState.user) {
      setIsSigningUp(true);
      userState
        .signup({ ...data, captcha: { recaptcha_challenge: captchaToken } })
        .then(() => {
          router.push("/onboarding").then(() => {
            setModalState({ state: ModalState.Closed });
          });
        })
        .catch((err: Error) => {
          toast.error(`Error: ${err.message}`);
        })
        .finally(() => {
          setIsSigningUp(false);
        });
    }
  };

  const [passwordIsShowing, setPasswordIsShowing] = useState(false);
  const toggleShowPassword = () => {
    setPasswordIsShowing(!passwordIsShowing);
  };

  const onGoToSignIn = () => {
    setModalState({ state: ModalState.SignIn });
  };

  return (
    <div className="px-4 pb-6 pt-8">
      <form onSubmit={handleSubmit(onSignUp)}>
        <TextInput
          label="Email"
          placeholder={"Email"}
          {...register("email", { required: true })}
        />
        <div className="h-6"></div>

        <TextInput
          label="Password"
          placeholder={"Password"}
          type={passwordIsShowing ? "text" : "password"}
          id={"inline-password"}
          renderSuffix={() => (
            <div>
              <TextButton
                onClick={toggleShowPassword}
                className="mx-3 duration-300 ease-in"
                size="md"
                type="button"
                variant="secondary"
              >
                {passwordIsShowing ? (
                  <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                ) : (
                  <FontAwesomeIcon icon={faEyeSlash} className="h-4 w-4" />
                )}
              </TextButton>
            </div>
          )}
          {...register("password", { required: true })}
        />
        {watch("password") && (
          <div className="animate-enter mt-3">
            <PasswordRequirements password={watch("password")} />
          </div>
        )}

        <InputCheckbox
          label="I agree to the FTX US Terms of Service"
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <div className="h-4"></div>
        <Button
          disabled={!agreed}
          type="submit"
          className="w-full"
          loading={isSigningUp}
        >
          Sign Up
        </Button>
        <div className="mx-auto mt-4 flex w-full items-center justify-center">
          <Text>Have an account?&nbsp; </Text>
          <TextButton
            onClick={onGoToSignIn}
            className="text-textAccent"
            type="button"
          >
            Sign In
          </TextButton>
        </div>
      </form>
    </div>
  );
};

const RecaptchaSignUpWrapper = () => {
  const [modalState, setModalState] = useModalState();
  return (
    <TitledModal
      isOpen={modalState.state === ModalState.SignUp}
      title="Sign Up"
      darkenBackground={false}
      onClose={() => setModalState({ state: ModalState.Closed })}
    >
      <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_KEY}>
        <SignUpModal />
      </GoogleReCaptchaProvider>
    </TitledModal>
  );
};

export default RecaptchaSignUpWrapper;
