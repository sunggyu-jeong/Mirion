import { differenceInDays, format, fromUnixTime, isAfter, startOfDay } from 'date-fns';

export const formatDate = (timestamp: bigint | number): string => {
  return format(fromUnixTime(Number(timestamp)), 'yyyy.MM.dd');
};

export const formatYMD = (date: string | number | Date) => {
  return format(new Date(date), 'yyyy.MM.dd');
};
export const formatTime = () => format(new Date(), 'HH:mm:ss');

export const getDiffInDays = (start: Date, end: Date) => differenceInDays(end, start);

export const isMatured = (unlockDate: string) => {
  const now = startOfDay(new Date());
  const unlock = startOfDay(new Date(unlockDate));
  return isAfter(now, unlock) || now.getTime() === unlock.getTime();
};
