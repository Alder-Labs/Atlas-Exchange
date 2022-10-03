export interface QueryProps<T> {
  onError?: (err: Error) => void;
  onSuccess?: (data: T) => void;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number | false;
}
