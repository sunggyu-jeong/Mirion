export const formatPrice = (amount: number | string | undefined): string => {
  const value = Number(amount);

  if (!value || value === 0) {
    return '0';
  }

  return value.toLocaleString('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
};
