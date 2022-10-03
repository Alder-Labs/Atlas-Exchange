import { useState } from 'react';

import { Button } from '../base';

import { TitledModalProps, TitledModal } from './TitledModal';

type TitledActionModalProps = TitledModalProps & {
  actionText: string;
  actionDisabled?: boolean;
  onAction: () => Promise<void> | void;
};

export function TitledActionModal(props: TitledActionModalProps) {
  const { actionText, actionDisabled, onAction, children, ...rest } = props;

  const [loadingAction, setLoadingAction] = useState(false);

  return (
    <TitledModal {...rest}>
      {children}
      <div className="flex flex-col items-center pb-6 pt-0">
        <Button
          rounded="full"
          disabled={actionDisabled}
          loading={loadingAction}
          onClick={async () => {
            setLoadingAction(true);
            await onAction();
            setLoadingAction(false);
          }}
        >
          {actionText}
        </Button>
      </div>
    </TitledModal>
  );
}
