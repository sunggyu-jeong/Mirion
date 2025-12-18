import { format, fromUnixTime } from "date-fns"

export const formatDate = (timestamp: bigint | number): string => {
  return format(fromUnixTime(Number(timestamp)), 'yyyy.mm.dd')
}