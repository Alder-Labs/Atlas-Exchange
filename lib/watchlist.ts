const WATCHLIST_KEY = 'user_asset_watchlist';

export function getWatchlist(): Record<string, boolean> {
  const val = localStorage.getItem(WATCHLIST_KEY);
  if (!val) {
    return {};
  }
  const watchlist = JSON.parse(val);
  return watchlist;
}

export function saveWatchlist(watchlist: Record<string, boolean>) {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
}
