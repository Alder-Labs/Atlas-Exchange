import { useEffect, useMemo, useRef, useState } from 'react';

import { useAtom } from 'jotai';
import { createPortal } from 'react-dom';

import { AuthStatus } from '../../hooks/kyc';
import { useBalances } from '../../hooks/wallet';
import { bscFocusedAtom, buyCoinIdAtom } from '../../lib/jotai';
import { Button } from '../base';

import { AvailableFunds } from './AvailableFunds';
import { BigNumberInput, getFontSizeForBuySell } from './BigNumberInput';
import { ConvertAllButton } from './ConvertAllButton';
import { ConvertPercentageButtons } from './ConvertPercentageButtons';
import { getPreviewContainerRoot } from './previewPortal';
import { QuotePreview } from './QuotePreview';
import { SelectCoin } from './SelectCoin';
import { SelectTradeUnit, TradeUnit } from './SelectTradeUnit';
import { TradeError } from './TradeError';
import { useQuote } from './useQuote';
import { useRedirectHandlers } from './useRedirectHandlers';

type ComponentType = 'buy' | 'sell' | 'convert';

function getConfig(type: ComponentType) {
  switch (type) {
    case 'buy':
      return {
        defaultFromCoinId: 'USD',
        defaultToCoinId: 'BTC',
        previewTitle: (fromCoin: string, toCoin: string) => `Buy ${toCoin}`,
        actionText: 'Buy',
      };
    case 'sell':
      return {
        defaultFromCoinId: 'BTC',
        defaultToCoinId: 'USD',
        previewTitle: (fromCoin: string, toCoin: string) => `Sell ${fromCoin}`,
        actionText: 'Sell',
      };
    case 'convert':
      return {
        defaultFromCoinId: 'BTC',
        defaultToCoinId: 'ETH',
        previewTitle: (fromCoin: string, toCoin: string) =>
          `Convert ${fromCoin} to ${toCoin}`,
        actionText: 'Convert',
      };
  }
}

function isZero(amount: string) {
  return !amount || parseFloat(amount) === 0;
}

interface BuySellConvertShellProps {
  type: ComponentType;
}

export function BuySellConvertShell(props: BuySellConvertShellProps) {
  const { type } = props;

  const config = useMemo(() => getConfig(type), [type]);

  const [fromAmount, setFromAmount] = useState('');
  const [fromCoinId, setFromCoinId] = useState(config.defaultFromCoinId);

  const [toAmount, setToAmount] = useState('');
  const [toCoinId, setToCoinId] = useState(config.defaultToCoinId);

  const [tradeUnit, setTradeUnit] = useState<TradeUnit>('from');

  const inputRef = useRef<HTMLInputElement>(null);

  const { refetch: refetchBalances } = useBalances();

  const {
    isLoading,
    error,
    quote,
    acceptQuoteLoading,
    solicitQuote,
    resetQuote,
    setTrigger,
  } = useQuote(
    useMemo(
      () => ({
        onQuoteClear: () => {
          setFromAmount('');
          setToAmount('');
        },
        onQuoteExecutionSuccess: () => {
          refetchBalances();
          setFromAmount('');
          setToAmount('');
        },
        solicitQuoteOnTriggerChange: false,
      }),
      [refetchBalances]
    )
  );

  const { requireAuthStatus } = useRedirectHandlers();

  useEffect(() => {
    if (tradeUnit === 'from') {
      setTrigger({
        fromCoinId: fromCoinId,
        toCoinId: toCoinId,
        fromAmount: fromAmount,
        toAmount: null,
      });
    } else {
      setTrigger({
        fromCoinId: fromCoinId,
        toCoinId: toCoinId,
        fromAmount: null,
        toAmount: toAmount,
      });
    }
  }, [setTrigger, tradeUnit, fromCoinId, toCoinId, fromAmount, toAmount]);

  const [buyCoinId, setBuyCoinId] = useAtom(buyCoinIdAtom);
  useEffect(() => {
    if (buyCoinId && type === 'buy') {
      setFromCoinId('USD');
      setToCoinId(buyCoinId);
      setBuyCoinId(null);
    }
  }, [buyCoinId, setBuyCoinId, type]);

  const [bscFocused] = useAtom(bscFocusedAtom);
  useEffect(() => {
    if (bscFocused && type === 'buy') {
      inputRef.current?.focus();
    }
  }, [bscFocused, type]);

  const root = getPreviewContainerRoot();
  if (!root) return null;
  return (
    <div className="flex h-full w-full flex-col items-center justify-between">
      <div className="flex w-full flex-col items-center">
        <div className="h-4"></div>
        <div className="relative flex h-12 w-full items-center justify-between gap-4">
          <div className="flex-1"></div>
          <BigNumberInput
            ref={inputRef}
            coinId={tradeUnit === 'from' ? fromCoinId : toCoinId}
            getFontSize={getFontSizeForBuySell}
            placeholder="0"
            value={tradeUnit === 'from' ? fromAmount : toAmount}
            onValueChange={(val) => {
              if (tradeUnit === 'from') {
                setFromAmount(val);
              } else {
                setToAmount(val);
              }
            }}
            onFocus={(e) => {
              if (!requireAuthStatus(AuthStatus.KycLevel2)) {
                e.target.blur();
              }
            }}
          />
          <div className="flex h-full flex-1 shrink-0 items-center justify-end">
            <SelectTradeUnit
              fromLabel={fromCoinId}
              toLabel={toCoinId}
              value={tradeUnit}
              onChange={(val) => {
                setTradeUnit(val);
              }}
            />
          </div>
        </div>

        {type === 'buy' ? (
          <ConvertPercentageButtons
            className="mt-4"
            onAmountChosen={(amount) => {
              if (!requireAuthStatus(AuthStatus.KycLevel2)) {
                return;
              }
              setFromAmount(amount);
            }}
            disabled={tradeUnit === 'to'}
          />
        ) : type === 'convert' || type === 'sell' ? (
          <ConvertAllButton
            buttonText={type === 'convert' ? 'Convert All' : 'Sell All'}
            coinId={fromCoinId}
            className="mt-4"
            onAmountChosen={(amount) => {
              if (!requireAuthStatus(AuthStatus.KycLevel2)) {
                return;
              }
              setFromAmount(amount);
            }}
            disabled={tradeUnit === 'to'}
          />
        ) : (
          <div />
        )}

        <div className="h-6"></div>
        {(type === 'convert' || type === 'sell') && (
          <div className="z-20 flex h-20 w-full items-center">
            <SelectCoin
              className="w-full"
              label={type === 'convert' ? 'From' : 'Sell'}
              coinId={fromCoinId}
              onCoinIdChange={(newCoinId) => {
                if (newCoinId != fromCoinId) {
                  setFromCoinId(newCoinId);
                }
              }}
            />
          </div>
        )}
        {(type === 'convert' || type === 'buy') && (
          <div className="z-10 flex h-20 w-full items-center">
            <SelectCoin
              label={type === 'convert' ? 'To' : 'Buy'}
              coinId={toCoinId}
              onCoinIdChange={(newCoinId) => {
                if (newCoinId != toCoinId) {
                  setToCoinId(newCoinId);
                }
              }}
            />
          </div>
        )}

        {(type === 'buy' || type === 'sell') && (
          <div className="flex h-20 w-full items-center">
            <AvailableFunds
              coinId={type === 'buy' ? 'USD' : fromCoinId}
              label={
                type === 'buy'
                  ? 'Available Buying Power'
                  : `Available ${fromCoinId}`
              }
            />
          </div>
        )}

        {error && (
          <TradeError
            error={error}
            toCoinId={toCoinId}
            fromCoinId={fromCoinId}
            type={type}
          />
        )}

        <Button
          className="mt-4 w-full"
          disabled={
            tradeUnit === 'from' ? isZero(fromAmount) : isZero(toAmount)
          }
          loading={isLoading}
          onClick={() => solicitQuote()}
        >
          Preview {config.actionText}
        </Button>

        {quote &&
          createPortal(
            <QuotePreview
              quote={quote.data}
              onBack={() => resetQuote()}
              onRefresh={() => solicitQuote()}
              onContinueEditing={() => resetQuote()}
              onAction={() => quote.acceptQuote()}
              actionText={config.actionText}
              actionLoading={acceptQuoteLoading}
              title={config.previewTitle(fromCoinId, toCoinId)}
            />,
            root
          )}
      </div>
    </div>
  );
}
