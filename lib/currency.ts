type RoundingMode = 'round' | 'floor' | 'ceil';

function renderAmount(
  amount: string | number,
  options: {
    minFixedDigits: number;
    maxFixedDigits: number;
    addCommas: boolean;
    roundingMode: RoundingMode;
  }
): string {
  const { minFixedDigits, maxFixedDigits, addCommas, roundingMode } = options;
  if (typeof amount === 'number') {
    let amt = amount;
    const pow = Math.pow(10, maxFixedDigits);
    if (roundingMode === 'ceil') {
      amount = Math.ceil(amount * pow) / pow;
    } else if (roundingMode === 'floor') {
      amount = Math.floor(amount * pow) / pow;
    } else if (roundingMode === 'round') {
      amount = Math.round(amount * pow) / pow;
    }
    console.log(amount);
    console.log('=', maxFixedDigits);
    // Truncate amount to between minFixedDigits and maxFixedDigits
    let res = amount.toFixed(
      Math.min(
        Math.max(minFixedDigits, amount.toString().split('.')[1]?.length || 0),
        maxFixedDigits
      )
    );

    if (addCommas) {
      const [whole, decimal] = res.split('.');
      res =
        whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
        (decimal ? '.' + decimal : '');
    }

    return res;
  } else {
    return amount;
  }
}

function getMaxFixedDigits(coinId: string, amount: string | number) {
  if (typeof amount === 'string') {
    return 0;
  }

  const magnitude = Math.abs(amount);
  if (coinId === 'USD') {
    if (magnitude <= 0.1) {
      return 8;
    } else {
      return 2;
    }
  } else {
    if (magnitude < 1) {
      return 8;
    } else if (magnitude < 1000) {
      return 2;
    } else {
      return 0;
    }
  }
}

function getMinFixedDigits(coinId: string, amount: string | number) {
  if (typeof amount === 'string') {
    return 0;
  }

  const magnitude = Math.abs(amount);
  if (magnitude < 1) {
    return 2;
  } else if (magnitude < 1000) {
    return 2;
  } else {
    return 0;
  }
}

export function renderCurrency({
  amount,
  coinId,
  showCoinId = true,
  maxFixedDigits = getMaxFixedDigits(coinId, amount),
  minFixedDigits = getMinFixedDigits(coinId, amount),
  addCommas = true,
  roundingMode = 'round',
}: {
  amount: number | string;
  coinId: string;
  showCoinId?: boolean;
  maxFixedDigits?: number;
  minFixedDigits?: number;
  addCommas?: boolean;
  roundingMode?: RoundingMode;
  removeTrailingZeroes?: boolean;
}): string {
  const amountString = renderAmount(amount, {
    minFixedDigits,
    maxFixedDigits,
    addCommas,
    roundingMode,
  });
  const prefix = coinId === 'USD' ? '$' : '';

  let result = `${prefix}${amountString}`;
  if (showCoinId) {
    result += ` ${coinId}`;
  }
  return result;
}
