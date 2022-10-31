import React, { useCallback, useEffect, useMemo, useState } from 'react';

import moment from 'moment';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';

import { SidePadding } from '../../components/layout/SidePadding';
import { AddressInformation } from '../../components/onboarding/AddressInformation';
import { EnterPhoneNumber } from '../../components/onboarding/EnterPhoneNumber';
import { PersonalDetails } from '../../components/onboarding/PersonalDetails';
import { ProofOfAddress } from '../../components/onboarding/ProofOfAddress';
import { SocialSecurity } from '../../components/onboarding/SocialSecurity';
import { StageNavigator } from '../../components/onboarding/StageNavigator';
import { FadeTransition } from '../../components/transitions/FadeTransition';
import { useModalState } from '../../hooks/modal';
import { useUserState } from '../../lib/auth-token-context';
import { LocalStorageKey } from '../../lib/local-storage-keys';
import { useMutationFetcher } from '../../lib/mutation';
import { toast } from '../../lib/toast';
import { CustomPage } from '../../lib/types';
import { AuthLevel } from '../../lib/types/auth-level';
import { ModalState } from '../../lib/types/modalState';

import type { KycForm, KycRawForm } from '../../lib/types/kyc';

function useUpdateQueryParams() {
  const router = useRouter();
  const updateQueryParams = useCallback(
    (newParams: Record<string, string | number>) => {
      router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          ...newParams,
        },
      });
    },
    [router]
  );

  return useMemo(() => ({ updateQueryParams }), [updateQueryParams]);
}

enum OnboardingStage {
  PERSONAL_DETAILS = 'PERSONAL_DETAILS',
  ADDRESS_INFORMATION = 'ADDRESS_INFORMATION',
  SOCIAL_SECURITY = 'SOCIAL_SECURITY',
  PHONE_NUMBER = 'PHONE_NUMBER',
  PROOF_OF_ADDRESS = 'PROOF_OF_ADDRESS',
}

const MAP_STAGE_TO_LABEL: Record<OnboardingStage, string> = {
  [OnboardingStage.PERSONAL_DETAILS]: 'Personal Details',
  [OnboardingStage.ADDRESS_INFORMATION]: 'Address Information',
  [OnboardingStage.PHONE_NUMBER]: 'Phone Number',
  [OnboardingStage.SOCIAL_SECURITY]: 'Social Security',
  [OnboardingStage.PROOF_OF_ADDRESS]: 'Proof of Address',
};

const ENABLED_STAGES = Object.values(OnboardingStage)
  .filter((val) => val != OnboardingStage.PROOF_OF_ADDRESS)
  .map((val) => {
    return {
      value: val,
      label: MAP_STAGE_TO_LABEL[val],
    };
  });

const OnboardingPage: CustomPage = () => {
  const router = useRouter();
  const userState = useUserState();
  const loginStatus = userState.loginStatusData;

  const { updateQueryParams } = useUpdateQueryParams();
  const currentStage =
    (router.query.stage as OnboardingStage) || OnboardingStage.PERSONAL_DETAILS;
  const [stageDisplayed, setStageDisplayed] = useState<OnboardingStage | null>(
    null
  );
  useEffect(() => {
    async function changeStageDisplay() {
      setStageDisplayed(null);
      await new Promise((resolve) => setTimeout(resolve, 100));
      setStageDisplayed(currentStage);
    }
    changeStageDisplay();
  }, [currentStage]);

  const [modalState, setModalState] = useModalState();
  useEffect(() => {
    setModalState({ state: ModalState.Closed });
  }, [setModalState]);

  const navStage = (stage: OnboardingStage) => {
    updateQueryParams({ stage });
  };

  const { isLoading: submitKycLevel1IsLoading, mutateAsync: submitKycLevel1 } =
    useMutation(
      useMutationFetcher<KycForm, { token: string }>(`/kyc/level1`, {
        onFetchSuccess: (res) => {
          return userState.updateToken(res.token);
        },
      }),
      {}
    );

  if (!loginStatus) return <></>;

  return (
    <>
      <SidePadding className="grow bg-grayLight-10 dark:bg-black">
        <div className="sm:px-8">
          <div className="h-8 sm:h-24"></div>
          <div className="grid-rows mb-32 grid w-full sm:grid-cols-3">
            <div className="hidden flex-none pr-20 dark:bg-black sm:col-span-1 sm:block sm:pt-24">
              <StageNavigator
                // enabledStages={ALL_STAGES.map((stage) => stage.value)}
                currentStage={currentStage}
                stages={ENABLED_STAGES}
                // enabledStages={ENABLED_STAGES}
                onStageClick={(newStage) => {
                  navStage(newStage);
                }}
              />
            </div>
            <div className="flex w-full flex-col items-start sm:col-span-2 sm:py-16">
              <FadeTransition
                show={stageDisplayed === OnboardingStage.PERSONAL_DETAILS}
              >
                <PersonalDetails
                  onContinue={() => {
                    navStage(OnboardingStage.ADDRESS_INFORMATION);
                  }}
                />
              </FadeTransition>
              <FadeTransition
                show={stageDisplayed === OnboardingStage.ADDRESS_INFORMATION}
              >
                <AddressInformation
                  onContinue={() => {
                    navStage(OnboardingStage.SOCIAL_SECURITY);
                  }}
                  onBack={() => {
                    navStage(OnboardingStage.PERSONAL_DETAILS);
                  }}
                />
              </FadeTransition>
              <FadeTransition
                show={stageDisplayed === OnboardingStage.SOCIAL_SECURITY}
              >
                <SocialSecurity
                  onContinue={() => {
                    navStage(OnboardingStage.PHONE_NUMBER);
                  }}
                  onBack={() => {
                    navStage(OnboardingStage.ADDRESS_INFORMATION);
                  }}
                />
              </FadeTransition>
              <FadeTransition
                show={stageDisplayed === OnboardingStage.PHONE_NUMBER}
              >
                <EnterPhoneNumber
                  onFinish={async () => {
                    const prevRawKycFormData: string | null =
                      localStorage.getItem(LocalStorageKey.KycForm);
                    if (!prevRawKycFormData) {
                      toast.error('No kyc data...');
                      return;
                    }

                    const rawKycData = JSON.parse(
                      prevRawKycFormData
                    ) as KycRawForm;

                    const dob = new Date(
                      `${rawKycData.month}/${rawKycData.day}/${rawKycData.year}`
                    );

                    if (!dob) {
                      toast.error('Invalid date of birth...');
                      return;
                    }

                    rawKycData.countryCode = `+${rawKycData.countryCode}`;
                    const kycLevel1Data: KycForm = {
                      ...rawKycData,
                      dateOfBirth: moment(dob).format('YYYY-MM-DD').toString(),
                      phoneNumber: `${rawKycData.countryCode}${rawKycData.phoneNumber}`,
                    };

                    return submitKycLevel1(kycLevel1Data)
                      .then((res) => {
                        localStorage.removeItem(LocalStorageKey.KycForm);
                        setModalState({
                          state: ModalState.Kyc1Complete,
                        });
                        router.push('/');
                      })
                      .catch((err: Error) => {
                        if (
                          err.message ===
                          'Phone number does not match country' ||
                          err.message ===
                          'Please complete level 2 and provide proof of address'
                        ) {
                          navStage(OnboardingStage.PROOF_OF_ADDRESS);
                          return;
                        }
                        toast.error(`Error: ${err.message}`);
                      });
                  }}
                  onBack={() => {
                    navStage(OnboardingStage.SOCIAL_SECURITY);
                  }}
                />
              </FadeTransition>
              <FadeTransition
                show={stageDisplayed === OnboardingStage.PROOF_OF_ADDRESS}
              >
                <ProofOfAddress
                  onContinue={() => {
                    router.push('/onboarding/identity-verification');
                  }}
                />
              </FadeTransition>
            </div>
          </div>
        </div>
      </SidePadding>
    </>
  );
};

const OnboardingPageWrapper: CustomPage = () => {
  return <OnboardingPage />;
};
OnboardingPageWrapper.requiredAuthLevel = AuthLevel.LoggedIn;
OnboardingPageWrapper.showFooter = false;

export default OnboardingPageWrapper;
