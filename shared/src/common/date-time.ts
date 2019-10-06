import { format, parse } from 'date-fns'
import { zonedTimeToUtc } from 'date-fns-tz'

export const DATETIME_DATE_FORMAT = "yyyy-MM-dd"
export const DATETIME_TIME_FORMAT = "HH:mm:ss"

export const DEFAULT_TIMEZONE = "Asia/Kolkata"

export interface DateTime {
    date: string
    time: string
}

export const toDateTime = (date: Date): DateTime => ({
    date: format(date, DATETIME_DATE_FORMAT),
    time: format(date, DATETIME_TIME_FORMAT)
})

export const fromDateTime = ({ date, time }: DateTime, timezone?: string): Date => {
    const newDate = parse(`${date} ${time}`, `${DATETIME_DATE_FORMAT} ${DATETIME_TIME_FORMAT}`, new Date())
    return timezone ? zonedTimeToUtc(newDate, timezone) : newDate
}