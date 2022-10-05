import { WithdrawCryptoInput } from '../../components/global-modals/send-receive/WithdrawCryptoConfirm';

import { Coin } from './coin';

export enum ModalState {
  Closed = "closed",

  // Auth
  SignIn = "SignIn",
  SignUp = "SignUp",
  ForgotPassword = "ForgotPassword",
  TotpAuth = "TotpAuth",
  SmsAuth = "SmsAuth",
  Kyc1Required = "Kyc1Required",
  Kyc2Required = "Kyc2Required",

  // One-off modals
  Kyc1Complete = "Kyc1Complete",

  // Actions
  DepositFiat = "DepositFiat",
  DepositWire = "DepositWire1",
  DepositWireConfirm = "WithdrawWire2",
  DepositAch = "DepositAch",
  DepositAchSuccess = "DepositAchSuccess",

  AchConnectAccount = "AchConnectBankAccount",

  WithdrawFiat = "WithdawFiat",
  WithdrawWire = "WithdrawWire",
  WithdrawWireSuccess = "WithdrawWireSuccess",
  WithdrawAch = "WithdrawAch",
  WithdrawAchSuccess = "WithdrawAchSuccess",

  // Send receive
  SendReceiveCrypto = "SendReceive",

  ReceiveCryptoSelect = "Receive1",
  ReceiveCryptoAddress = "Receive2",
  SendCryptoSelect = "Send1",
  SendCryptoForm = "Send2",
  SendCryptoConfirm = "Send3",
  SendCryptoSuccess = "Send4",
}

type ModalStateWithPayload =
  | {
      state: ModalState.DepositWire;
      coinId?: string;
    }
  | {
      state: ModalState.SendCryptoForm;
      coinId: string;
    }
  | {
      state: ModalState.SendCryptoConfirm;
      coin: Coin;
      data: WithdrawCryptoInput;
    }
  | {
      state: ModalState.ReceiveCryptoAddress;
      coinId: string;
    }
  | {
      state: ModalState.DepositAch;
      title?: string;
      showBackButton?: boolean;
    };

export type ModalStateDetailed =
  | ModalStateWithPayload
  | {
      state: Exclude<ModalState, ModalStateWithPayload["state"]>;
    };

const ALL_MODAL_STATES = Object.values(ModalState);
