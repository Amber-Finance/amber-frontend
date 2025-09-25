import dayjs from 'dayjs'

export function formatChartDate(timestamp: string | number): string {
  return dayjs(parseInt(timestamp.toString())).format('MMM D')
}
