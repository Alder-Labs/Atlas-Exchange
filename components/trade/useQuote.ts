import { useEffect, useMemo, useCallback } from 'react';

import { useMutation, useQuery, useQueryClient } from 'react-query';

import { useDebounce } from '../../hooks/useDebounce';
import { renderCurrency } from '../../lib/currency';
import { useFetcher } from '../../lib/fetcher';
import { useMutationFetcher } from '../../lib/mutation';
import { toast } from '../../lib/toast';
import { Fill, Quote } from '../../lib/types';

import { Trigger, useTrigger } from './useTrigger';

interface Options {
  // trigger.fromAmount changed
  onExecuteUsingFromAmount?: () => void;
  // trigger.toAmount changed
  onExecuteUsingToAmount?: () => void;
  // quote cleared (trigger === null)
  onQuoteClear?: () => void;
  // Successful quote execution
  onQuoteExecutionSuccess?: () => void;
  // Quote successfully generated
  onQuoteGenerated?: (quote: Quote, trigger: Trigger) => void;

  solicitQuoteOnTriggerChange?: boolean;
}
export function useQuote(options: Options) {
  const {
    onExecuteUsingFromAmount,
    onExecuteUsingToAmount,
    onQuoteClear,
    onQuoteExecutionSuccess,
    onQuoteGenerated,
    solicitQuoteOnTriggerChange = true,
  } = options;

  const { trigger, setTrigger } = useTrigger();

  // const debouncedTrigger = useDebounce(trigger, 1000);
  // Do not debounce for now since we're using preview buy
  const debouncedTrigger = trigger;

  const queryClient = useQueryClient();
  const {
    data: getQuoteData,
    error: getQuoteError,
    isLoading: getQuoteDataLoading,
    mutate: getQuote,
    reset: resetQuote,
  } = useMutation(
    useMutationFetcher<
      {
        fromCoin: string;
        toCoin: string;
        size?: string;
        proceedsSize?: string;
      },
      { quoteId: string }
    >('/proxy/api/otc/quotes'),
    {
      onMutate: () => {
        queryClient.cancelQueries('/proxy/api/otc/quotes/');
      },
    }
  );

  // Whenever we generate a [quoteId], we need to fetch the related quote data
  const {
    data: quoteData,
    error: quoteError,
    isLoading: quoteDataLoading,
  } = useQuery(
    `/proxy/api/otc/quotes/${getQuoteData?.quoteId}`,
    useFetcher<Quote>(),
    {
      enabled: !!getQuoteData?.quoteId,
      onSuccess: (quote) => {
        if (onQuoteGenerated && trigger) {
          onQuoteGenerated(quote, trigger);
        }
        queryClient.cancelQueries('/proxy/api/otc/quotes/');
      },
    }
  );

  const isLoading = getQuoteDataLoading || quoteDataLoading;
  const error = (getQuoteError || quoteError) as Error | undefined;

  // Accept the generated [quoteId]
  const { isLoading: acceptQuoteLoading, mutate: acceptQuote } = useMutation(
    useMutationFetcher<void, { fill: Fill }>(
      `/proxy/api/otc/quotes/${getQuoteData?.quoteId}/accept`
    ),
    {
      onSuccess: (data) => {
        if (data.fill.side === 'buy') {
          toast.success(
            `Bought ${renderCurrency({
              amount: data.fill.size,
              coinId: data.fill.baseCurrency,
              showCoinId: false,
            })} ${data.fill.baseCurrency}`
          );
        } else {
          toast.success(
            `Bought ${renderCurrency({
              amount: data.fill.size * data.fill.price,
              coinId: data.fill.quoteCurrency,
              showCoinId: false,
            })} ${data.fill.quoteCurrency}`
          );
        }

        setTrigger(null);
        onQuoteExecutionSuccess?.();
      },
      onError: (err: any) => {
        toast.error(`Error: ${err.message}`);
      },
    }
  );

  useEffect(() => {
    resetQuote();
  }, [resetQuote, trigger]);

  const solicitQuote = useCallback(() => {
    if (debouncedTrigger) {
      if (!debouncedTrigger.fromCoinId || !debouncedTrigger.toCoinId) {
        return;
      }
      if (debouncedTrigger.fromAmount && debouncedTrigger.toAmount) {
        // Cannot have both amounts
        return;
      }

      if (debouncedTrigger.fromAmount) {
        onExecuteUsingFromAmount?.();
        getQuote({
          fromCoin: debouncedTrigger.fromCoinId,
          toCoin: debouncedTrigger.toCoinId,
          size: debouncedTrigger.fromAmount,
        });
      } else if (debouncedTrigger.toAmount) {
        onExecuteUsingToAmount?.();
        getQuote({
          fromCoin: debouncedTrigger.fromCoinId,
          toCoin: debouncedTrigger.toCoinId,
          proceedsSize: debouncedTrigger.toAmount,
        });
      } else {
        onQuoteClear?.();
        resetQuote();
        return;
      }
    } else {
      onQuoteClear?.();
      resetQuote();
    }
  }, [
    debouncedTrigger,
    getQuote,
    onExecuteUsingFromAmount,
    onExecuteUsingToAmount,
    onQuoteClear,
    resetQuote,
  ]);

  useEffect(() => {
    if (solicitQuoteOnTriggerChange) {
      solicitQuote();
    }
  }, [solicitQuote, solicitQuoteOnTriggerChange]);

  return useMemo(
    () => ({
      setTrigger,
      isLoading,
      acceptQuoteLoading,
      error,
      solicitQuote,
      resetQuote,
      quote: quoteData
        ? {
            data: quoteData,
            acceptQuote,
          }
        : null,
    }),
    [
      acceptQuote,
      acceptQuoteLoading,
      error,
      isLoading,
      quoteData,
      resetQuote,
      setTrigger,
      solicitQuote,
    ]
  );
}
