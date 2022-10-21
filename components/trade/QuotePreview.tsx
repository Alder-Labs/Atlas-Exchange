import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useBalances } from '../../hooks/useBalances';
import { useCurrentDate } from '../../hooks/useCurrentDate';
import { useUserState } from '../../lib/auth-token-context';
import { renderCurrency } from '../../lib/currency';
import { Quote } from '../../lib/types';
import { Button, Title, Text } from '../base';

export interface QuotePreviewProps {
  quote: Quote;

  onBack: () => void;
  onContinueEditing: () => void;
  onRefresh: () => void;

  onAction: () => void;
  actionText: string;
  actionLoading: boolean;

  title: string;
}

export function QuotePreview(props: QuotePreviewProps) {
  const userState = useUserState();

  const {
    quote,
    onBack,
    onContinueEditing,
    onAction,
    onRefresh,
    title,
    actionText,
    actionLoading,
  } = props;

  const toCoinId = quote.side === 'buy' ? quote.baseCoin : quote.quoteCoin;
  const fromCoinId = quote.side === 'buy' ? quote.quoteCoin : quote.baseCoin;

  const {
    balancesMap,
    refetch: refetchBalances,
    isLoading: balancesIsLoading,
    error: balanceError,
  } = useBalances();

  const currentDate = useCurrentDate();
  const secondsBetweenDates = Math.floor(
    (quote.expiry * 1000 - currentDate.getTime()) / 1000
  );
  const isExpired = secondsBetweenDates <= 0;

  return (
    <div className="pointer-events-auto h-full w-full bg-white dark:bg-black">
      <div className="flex w-full items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="h-4 w-4 text-grayLight-50 transition hover:text-grayLight-80 dark:hover:text-white"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div className="flex-1 text-center">
          <Title order={4}>{title}</Title>
        </div>
        <div className="w-4"></div>
      </div>
      <div className="h-12"></div>

      <div className="flex w-full flex-col">
        <div className="flex w-full justify-between">
          <Text size="md" className="font-medium" color="secondary">
            Price
          </Text>
          <Text
            size="md"
            className="font-medium"
            isLoading={!quote}
            loadingWidth="4rem"
          >
            {renderCurrency({
              coinId: toCoinId,
              amount: 1,
              minFixedDigits: 0,
              maxFixedDigits: 0,
              showCoinId: toCoinId !== 'USD',
            })}{' '}
            ={' '}
            {renderCurrency({
              coinId: fromCoinId,
              amount: quote.side === 'buy' ? quote.price : 1 / quote.price,
              showCoinId: fromCoinId !== 'USD',
            })}
          </Text>
        </div>
        <div className="h-4"></div>

        <div className="flex w-full justify-between">
          <Text size="md" className="font-medium" color="secondary">
            Balance
          </Text>
          <Text
            size="md"
            className="font-medium"
            isLoading={!quote}
            loadingWidth="4rem"
          >
            {renderCurrency({
              coinId: fromCoinId,
              amount: balancesMap?.[fromCoinId]?.total ?? 0,
              showCoinId: fromCoinId !== 'USD',
            })}{' '}
          </Text>
        </div>
        <div className="h-4"></div>

        <div className="flex w-full justify-between">
          <Text size="md" className="font-medium" color="secondary">
            Spend
          </Text>
          <Text
            size="md"
            className="font-medium"
            isLoading={!quote}
            loadingWidth="4rem"
          >
            {renderCurrency({
              coinId: fromCoinId,
              amount: quote.cost ?? 0,
              showCoinId: fromCoinId !== 'USD',
            })}{' '}
          </Text>
        </div>

        <div className="my-4 h-px w-full bg-grayLight-70"></div>

        <div className="flex w-full justify-between">
          <Text size="md" className="font-medium" color="secondary">
            Receive
          </Text>
          <Text
            size="md"
            className="font-medium"
            isLoading={!quote}
            loadingWidth="4rem"
          >
            {renderCurrency({
              coinId: quote.toCoin ?? '',
              amount: quote.proceeds ?? 0,
            })}
          </Text>
        </div>
      </div>

      <div className="h-12"></div>
      {isExpired ? (
        <Button className="w-full" loading={actionLoading} onClick={onRefresh}>
          Refresh
        </Button>
      ) : (
        <Button className="w-full" loading={actionLoading} onClick={onAction}>
          {actionText} ({secondsBetweenDates}s)
        </Button>
      )}

      <div className="h-3"></div>
      <Button
        className="w-full"
        variant="secondary"
        onClick={onContinueEditing}
      >
        Continue Editing
      </Button>
    </div>
  );
}
