import moment from 'moment';

// Get year from date
const getYear = (date: Date) => moment(date).year();

// get month from date
const getMonth = (date: Date) => moment(date).month();

export const CustomDatePickerHeader = ({
  // @ts-ignore
  date,
  // @ts-ignore
  changeYear,
  // @ts-ignore
  changeMonth,
  // @ts-ignore
  decreaseMonth,
  // @ts-ignore
  increaseMonth,
  // @ts-ignore
  prevMonthButtonDisabled,
  // @ts-ignore
  nextMonthButtonDisabled,
}) => {
  // create a list of years from 1900 to current year
  const years = [];
  for (let i = 1900; i <= getYear(new Date()); i++) {
    years.push(i);
  }

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return (
    <div
      style={{
        margin: 10,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
        {'<'}
      </button>
      <select
        value={getYear(date)}
        onChange={({ target: { value } }) => changeYear(value)}
      >
        {years.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <select
        value={months[getMonth(date)]}
        onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
      >
        {months.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
        {'>'}
      </button>
    </div>
  );
};
