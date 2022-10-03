// Keep as numeric enum because comparison operator is used.

export enum AuthLevel {
  None = 1,
  LoggedIn = 2,
  KycLevel1 = 3,
  KycLevel2 = 4,
}
