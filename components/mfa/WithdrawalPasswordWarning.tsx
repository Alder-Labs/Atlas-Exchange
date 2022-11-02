import { Button, Text } from '../base';

export function WithdrawalPasswordWarning(props: { onClick: () => void }) {
  return (
    <div>
      <Text>
        For 24 hours after you change or disable your withdrawal password, you
        will not be able to withdraw funds from your account.This is for your
        account&apos;s security.
      </Text>
      <div className="h-6" />
      <Button onClick={props.onClick}>I understand</Button>
    </div>
  );
}
