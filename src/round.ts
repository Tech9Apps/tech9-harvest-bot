const roundTo = (number: number, precision: number) => {
  if (precision === Number.POSITIVE_INFINITY) {
    return number;
  }

  if (!Number.isInteger(precision)) {
    throw new TypeError('Expected precision to be an integer');
  }

  const isRoundingAndNegative = number < 0;
  if (isRoundingAndNegative) {
    number = Math.abs(number);
  }

  const power = 10 ** precision;

  let result = Math.round(Number((number * power).toPrecision(15))) / power;

  if (isRoundingAndNegative) {
    result = -result;
  }

  return result;
};

export default roundTo;