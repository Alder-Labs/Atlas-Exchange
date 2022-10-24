import { ReactNode } from 'react';

import { faArrowLeft, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Text } from '../base';
import { Modal, ModalProps } from '../base/Modal';

export interface TitledModalProps extends ModalProps {
  children?: ReactNode;
  isOpen: boolean;
  title: string;
  showCloseButton?: boolean;
  renderWhenClosed?: boolean;

  onClose?: () => void;
  onClickCloseButton?: () => void;
  onGoBack?: () => void;
}

export function TitledModal({
  children,
  isOpen,
  title,
  renderWhenClosed = false,
  onClose = () => {},
  showCloseButton = true,
  onClickCloseButton,
  onGoBack,
  ...rest
}: TitledModalProps) {
  const handleCloseButtonClick = () => {
    if (onClickCloseButton) {
      onClickCloseButton();
    } else {
      onClose();
    }
  };

  if (!renderWhenClosed && !isOpen) {
    return null;
  }

  return (
    <Modal {...rest} isOpen={isOpen} onClose={onClose}>
      <div className="box-border flex w-full flex-col-reverse rounded-md border-grayLight-70 bg-white text-white shadow-md dark:bg-grayDark-20">
        {children}
        <div className="flex items-baseline justify-center gap-2 border-b border-grayLight-40 p-4 pb-4 dark:border-grayDark-40">
          <div className="flex flex-1 justify-start">
            {onGoBack && (
              <button
                onClick={onGoBack}
                className="h-4 w-4 text-grayLight-50 transition hover:text-grayLight-80 dark:hover:text-white"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
            )}
          </div>
          <Modal.Title>
            <Text size="lg">{title}</Text>
          </Modal.Title>
          <div className="flex flex-1 justify-end">
            {showCloseButton && (
              <button
                onClick={handleCloseButtonClick}
                className="h-5 w-5 shrink-0 text-grayLight-50 transition hover:text-grayLight-80 dark:hover:text-white"
              >
                <FontAwesomeIcon className="h-full w-full" icon={faXmark} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
