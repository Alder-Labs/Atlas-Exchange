import { LocalStorageKey } from './local-storage-keys';

export function getWatchlist(): Record<string, boolean> {
  const val = localStorage.getItem(LocalStorageKey.WatchList);
  if (!val) {
    return {};
  }
  const watchlist = JSON.parse(val);
  return watchlist;
}

export function saveWatchlist(watchlist: Record<string, boolean>) {
  localStorage.setItem(LocalStorageKey.WatchList, JSON.stringify(watchlist));
}
