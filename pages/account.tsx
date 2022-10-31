import React, { HTMLAttributes } from 'react';

import { Tab } from '@headlessui/react';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';

import { Title, Text, Button } from '../components/base';
import { SidePadding } from '../components/layout/SidePadding';
import { SetSmsModal } from '../components/mfa/SetSmsModal';
import { SetTotpModal } from '../components/mfa/SetTotpModal';
import { SetWithdrawalPasswordModal } from '../components/mfa/SetWithdrawalPasswordModal';
import { AuthStatus, useAuthStatus } from '../hooks/auth';
import { useStripeVerificationStatus } from '../hooks/kyc';
import { useUserState } from '../lib/auth-token-context';
import { useDarkOrLightMode } from '../lib/dark-mode';
import { useMutationFetcher } from '../lib/mutation';
import { toast } from '../lib/toast';
import { CustomPage } from '../lib/types';

const AccountNavbarTab = ({
  label,
  selected,
}: {
  label: string;
  selected: boolean;
}) => {
  const styles = clsx({
    'py-4 px-3 border-b-4 text-xl outline-none select-none translate-y-[2px]':
      true,
    'border-textAccent text-textAccent': selected,
    'border-transparent text-grayLight-50': !selected,
  });
  return (
    <>
      <span className={styles}>{label}</span>
    </>
  );
};

type AccountOptionProps = {
  title?: string;
  subtitle?: string;
  description?: string;
  buttonLabel?: string;
  buttonAction?: () => void;
  buttonDisabled?: boolean;
  leftChild?: React.ReactNode; // overrides title/description
  rightChild?: React.ReactNode; // overrides action / actionLabel
} & HTMLAttributes<HTMLDivElement>;

const AccountOptionsContainer = ({
  children,
}: HTMLAttributes<HTMLDivElement>) => {
  const primaryStyle = clsx({
    ['rounded-2xl border-2 p-4 border-grayLight-30 dark:border-grayDark-30']:
      true,
    ['dark:bg-grayDark-10 bg-grayLight-0']: true,
  });
  return <div className={primaryStyle}>{children}</div>;
};

const AccountOption = ({
  className,
  title,
  subtitle,
  description,
  buttonAction,
  buttonDisabled = false,
  buttonLabel,
  leftChild,
  rightChild,
}: AccountOptionProps) => {
  const darkMode = useDarkOrLightMode();

  return (
    <div
      className={clsx({
        ['flex flex-col items-start gap-4 text-md sm:flex-row sm:items-center']:
          true,
        [`${className}`]: className,
      })}
    >
      <div className="w-full">
        {leftChild || (
          <>
            <Title order={4}>{title}</Title>
            {subtitle && (
              <>
                <div className="h-1"></div>
                <Text>{subtitle}</Text>
              </>
            )}

            <div className="h-2" />
            <Text color="secondary">{description}</Text>
          </>
        )}
      </div>
      {rightChild || (
        <Button
          variant={darkMode === 'dark' ? 'secondary' : 'outline'}
          disabled={buttonDisabled}
          onClick={buttonAction}
        >
          {buttonLabel}
        </Button>
      )}
    </div>
  );
};

const SecurityTabContent = () => {
  const userState = useUserState();
  const loginStatus = userState.loginStatusData;

  const { isLoading: changePasswordLoading, mutate: changePassword } =
    useMutation(
      useMutationFetcher<{}, {}>(
        `/proxy/api/users/authenticated_change_password`
      ),
      {
        onSuccess: (data) => {
          toast.success('Reset password email sent.');
        },
        onError: (error) => {
          toast.error(`Error resetting password. Please contact support.`);
        },
      }
    );

  return (
    <div className="w-full">
      <div className="h-8" />
      <AccountOptionsContainer>
        <AccountOption
          title="Password"
          description="Request an email with instructions for changing your
          password. This will prevent you from withdrawing for 24 hours."
          rightChild={
            <Button
              onClick={() => changePassword({})}
              loading={changePasswordLoading}
              className={'w-48'}
              variant="secondary"
            >
              Reset Password
            </Button>
          }
        />
      </AccountOptionsContainer>
      <div className="h-8" />
      <AccountOptionsContainer>
        <AccountOption
          leftChild={
            <>
              <Title order={4}>Two Factor Authentication</Title>
              <div className="h-2" />
              {loginStatus &&
                loginStatus.user &&
                loginStatus.user.mfa === null && (
                  <Text color="error">Disabled</Text>
                )}
              <div className="h-2" />
              <Text color="secondary">
                Two factor authentication provides increased security by asking
                for additional information when logging in and performing
                important actions.
              </Text>
            </>
          }
          rightChild={
            <>
              {loginStatus && loginStatus.user && (
                <div className="flex flex-none flex-col items-stretch justify-start">
                  <SetTotpModal mfa={loginStatus.user.mfa} />
                  <div className="h-2" />
                  <SetSmsModal mfa={loginStatus.user.mfa} />
                </div>
              )}
            </>
          }
        />
      </AccountOptionsContainer>
      <div className="h-8" />
      <AccountOptionsContainer>
        <AccountOption
          title="Withdrawal Password"
          description="Set up a separate password for withdrawals"
          rightChild={<SetWithdrawalPasswordModal />}
        />
      </AccountOptionsContainer>
      <div className="h-8" />
    </div>
  );
};

const IdentityTabContent = () => {
  const router = useRouter();

  const userState = useUserState();
  const loginStatusData = userState.loginStatusData;

  const status = useAuthStatus();
  const { authStatus } = status;
  const { data: stripeVerificationStatus } = useStripeVerificationStatus();

  const onClickIdentityLevel1 = () => {
    router.push('/onboarding');
  };

  const onChangeIdentityLevel2 = () => {
    if (!loginStatusData) {
      return;
    }
    if (!loginStatusData.user?.mfa) {
      toast.error(
        'Please enable MFA before starting identity verification level 2'
      );
      return;
    }
    switch (stripeVerificationStatus) {
      case 'success':
        toast.error('Identity verification is already completed');
        return;
      case 'not_started':
      default:
        router.push('/onboarding/identity-verification');
        return;
    }
  };

  const kycLevel2SubmitDisabled =
    authStatus === AuthStatus.KycLevel1 &&
    (status.level2AppStatus === 'pending' ||
      status.level2AppStatus === 'actions-needed');
  return (
    <div className="w-full">
      <div className="h-8" />
      {authStatus == AuthStatus.Rejected && (
        <div>
          <AccountOptionsContainer>
            <Title order={4} className="font-bold">
              Identity Verification Failed
            </Title>
            <div className="h-2"></div>
            <Text size="md" color="secondary">
              Your identity verification application has been rejected. If this
              was a mistake please contact support.
            </Text>
            <div className="h-6"></div>
            <Button
              size="md"
              className="w-48"
              onClick={() => {
                router.push('/support');
              }}
            >
              Contact Support
            </Button>
          </AccountOptionsContainer>
          <div className="h-8" />
        </div>
      )}

      {[
        AuthStatus.KycLevel0,
        AuthStatus.KycLevel1,
        AuthStatus.KycLevel2,
      ].includes(authStatus) && (
        <div>
          <AccountOptionsContainer>
            <AccountOption
              title="Identity Verification: Level 1"
              subtitle="Share your personal information"
              description="Unlimited crypto withdrawals"
              leftChild={
                <div className={'flex flex-col'}>
                  <div className="flex flex-row">
                    <Title>Identity Verification: Level 1</Title>
                    {authStatus >= AuthStatus.KycLevel1 && (
                      <Text size="2xl" color="success">
                        &nbsp;(Verified)
                      </Text>
                    )}
                  </div>
                  <div className="h-2" />
                  <Text color="secondary">
                    No crypto deposit limits <br />
                    $10,000 USD limit for crypto withdrawals per day <br />
                    No fiat deposits or withdrawals{' '}
                  </Text>
                  {authStatus === AuthStatus.KycLevel0 && (
                    <>
                      <div className="h-2" />
                      <Text color="warning">Takes less than 5 minutes</Text>
                    </>
                  )}
                </div>
              }
              rightChild={
                <div>
                  {authStatus === AuthStatus.KycLevel0 ? (
                    <Button
                      className="w-48"
                      variant={'primary'}
                      onClick={onClickIdentityLevel1}
                    >
                      Continue
                    </Button>
                  ) : (
                    <></>
                  )}
                </div>
              }
            />
          </AccountOptionsContainer>
          <div className="h-8" />
          <AccountOptionsContainer>
            <AccountOption
              title="Identity Verification: Level 2"
              subtitle="Upload identity documents"
              description="Unlimited crypto withdrawals"
              leftChild={
                <div className={'flex flex-col'}>
                  <div className="flex flex-row">
                    <Title>Identity Verification: Level 2</Title>

                    {authStatus === AuthStatus.KycLevel2 ? (
                      <Text size="2xl" color="success">
                        &nbsp;(Verified)
                      </Text>
                    ) : authStatus === AuthStatus.KycLevel1 &&
                      status.level2AppStatus === 'pending' ? (
                      <span className={'text-2xl text-warning'}>
                        &nbsp;(Pending)
                      </span>
                    ) : authStatus === AuthStatus.KycLevel1 &&
                      status.level2AppStatus === 'actions-needed' ? (
                      <>
                        <span className={'text-2xl text-error'}>
                          &nbsp;(Action Needed)
                        </span>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                  <div className="h-1"></div>
                  <Text color="normal" weight="medium">
                    Upload identity documents
                  </Text>
                  <div className="h-4" />
                  <Text color="secondary">
                    Unlimited USD deposits and withdrawals
                  </Text>
                  <Text color="secondary">Unlimited crypto withdrawals</Text>
                  {!kycLevel2SubmitDisabled && (
                    <>
                      <div className="h-2" />
                      <Text color="info">Takes less than 5 minutes</Text>
                    </>
                  )}
                </div>
              }
              rightChild={
                authStatus === AuthStatus.KycLevel2 ? (
                  <div></div>
                ) : (
                  <Button
                    className="w-48"
                    variant={'primary'}
                    onClick={onChangeIdentityLevel2}
                    disabled={kycLevel2SubmitDisabled}
                  >
                    Continue
                  </Button>
                )
              }
            />
          </AccountOptionsContainer>
        </div>
      )}
      <div className="h-12" />
    </div>
  );
};

const AccountNavbar = ({
  tabs,
  controlledTabIndex = 0,
}: {
  tabs: { [key: string]: React.ReactNode }[];
  controlledTabIndex?: number; // Pass in tab from query param
}) => {
  const router = useRouter();

  return (
    <Tab.Group
      onChange={(index) => {
        router.push({
          pathname: router.pathname,
          query: { ...router.query, tabIndex: index },
        });
      }}
      {...(controlledTabIndex && { selectedIndex: controlledTabIndex })}
    >
      <Tab.List className="flex w-full flex-nowrap gap-6 border-b-2 border-grayLight-30 pb-4 dark:border-grayDark-50">
        {tabs.map((t) => (
          <Tab key={Object.keys(t)[0]} className="outline-none">
            {({ selected }) => (
              <AccountNavbarTab label={Object.keys(t)[0]} selected={selected} />
            )}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels>
        {tabs.map((t) => (
          <Tab.Panel key={Object.keys(t)[0]}>{Object.values(t)[0]}</Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
};

const Account: CustomPage = () => {
  const router = useRouter();
  const tabIndex = router.query.tabIndex ? Number(router.query.tabIndex) : 0;

  const tabs: { [key: string]: React.ReactNode }[] = [
    { Security: <SecurityTabContent /> },
    { Identity: <IdentityTabContent /> },
  ];

  const userState = useUserState();
  const loginStatusData = userState.loginStatusData;

  const displayName = loginStatusData?.user?.displayName;
  const feeTier = loginStatusData?.user?.feeTier;

  return (
    <SidePadding>
      <div className="sm:px-8">
        <div className="h-8" />
        <Title loadingWidth={'12rem'}>
          {displayName ? `${displayName}` : ''}
        </Title>
        <div className="h-1" />
        <Text color="secondary" loadingWidth="8rem">
          Fee tier: Level {feeTier}
        </Text>
        <div className={'min-h-screen max-w-3xl'}>
          <div className="h-8" />
          <AccountNavbar tabs={tabs} controlledTabIndex={tabIndex} />
        </div>
      </div>
    </SidePadding>
  );
};

export default Account;
