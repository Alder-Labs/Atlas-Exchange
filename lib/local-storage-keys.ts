export enum LocalStorageKey {
  // Used in auth context
  User = 'userObject',
  TokenDate = 'tokenDate',

  // Store kyc form data between refreshes
  KycForm = 'kycForm',

  // Market watchlist (store which tokens to watch)
  WatchList = 'user_asset_watchlist',

  SardineSdkConfig = 'sardineSdkConfig',
  DarkModeTheme = 'darkModeTheme',
}
