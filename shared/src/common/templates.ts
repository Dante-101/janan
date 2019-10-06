import { strEnum } from './types'

export const ConstStringsEnum = strEnum(["STR1", "STR2"])
export type ConstStrings = keyof typeof ConstStringsEnum
export const constStringsList: ConstStrings[] = Object.keys(ConstStringsEnum) as ConstStrings[]
export const isConstStrings = (type?: string): type is ConstStrings => !!type && constStringsList.includes(type as ConstStrings)
