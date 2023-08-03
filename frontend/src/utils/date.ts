import type { Dayjs } from 'dayjs'

export const getDecimalHour = (date: Dayjs) => (
    date.hour() + date.minute() / 60
)
