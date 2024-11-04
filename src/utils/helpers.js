const POSTFIXES = ['', 'K', 'M', 'B', 'T', 'P', 'E', 'Z', 'Y'];

export const formatWithPostfix = value => {
  const numValue = Number(value);
  if (isNaN(numValue)) return value;

  if (numValue < 0.01) return '<0.01';
  if (numValue < 1) return numValue.toFixed(2);

  const group = Math.floor(Math.log10(numValue) / 3);
  const postfix = POSTFIXES[group] || '';
  const normalizedValue = (numValue / Math.pow(10, group * 3)).toFixed(2);

  return `${normalizedValue} ${postfix}`;
};
