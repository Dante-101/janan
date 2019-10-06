import { ExtError, ExtErrorCode } from '../framework/error'
import { shortenTxt } from './transform'

export const is2xx = (httpCode?: number) => (httpCode && httpCode.toString()[0] === '2')
export const is4xx = (httpCode?: number) => (httpCode && httpCode.toString()[0] === '4')
export const is5xx = (httpCode?: number) => (httpCode && httpCode.toString()[0] === '5')

const phoneRegEx = /^\d{10}$/
export const isValidPhoneNumber = (phone?: any): boolean => {
    if (!phone) return false
    if (typeof phone != 'string') return false
    return phoneRegEx.test(phone)
}

const zipRegEx = /^\d{6}$/
export const isValidZipCode = (zip?: any): boolean => {
    if (!zip) return false
    if (typeof zip != 'string') return false
    return zipRegEx.test(zip)
}

//Picked from http://emailregex.com/
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
export const isValidEmail = (email?: string): boolean => {
    return !!(email && emailRegex.test(email))
}

//Taken from https://github.com/honeinc/is-iso-date/blob/master/index.js
var isoDateRegExp = new RegExp(/(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/)
export const isIsoDate = (str: string) => isoDateRegExp.test(str)

// Inspired from https://github.com/then/is-promise/blob/master/index.js
export function isPromise<T>(value: any): value is Promise<T> {
    return !!value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function'
}

export function isNumeric(obj: any): obj is number {
    return !Array.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0
}

export function isPositiveInt(val: string | number): boolean {
    const newVal = typeof val == 'string' ? parseInt(val) : val
    return !isNaN(newVal) && newVal > 0 && Number.isSafeInteger(newVal)
}

//Lower cases are automatically considered
export let isBoolean = (value: string): boolean => {
    const trueArr = ["True", "T"]
    const falseArr = ["False", "F"]

    let isIn = (arr: string[]) => arr.some(x => x.toLowerCase() == value.toString().toLowerCase())

    if (isIn(trueArr))
        return true
    else if (isIn(falseArr))
        return false
    else
        throw new ExtError(`Invalid value specified for boolean '${value}'`, "INVALID_ARGUMENTS")
}

export const isPlainObject = (obj: any): boolean => !!(typeof obj == 'object' && obj instanceof Object && !Array.isArray(obj))

//Check if the field is there. Else error.
export const validateFieldsPresence = <T extends object>(objs: T[], fields: (keyof T)[], errorCode: ExtErrorCode = "MISSING_DATA", objStrInMsg: boolean = false) => {
    if (objs.length == 0 || fields.length == 0) { return }
    objs.forEach(o => {
        fields.forEach(field => {
            if (o[field] == null) {
                const objStr = objStrInMsg ? ` in ${shortenTxt(JSON.stringify(o))}` : ""
                throw new ExtError(missingFieldMsg(field, objStr ? o : null), errorCode).setHttpStatus(400)
            }
        })
    })
}
const missingFieldMsg = <T extends object>(field: keyof T, obj?: T | null) => `Missing required field '${field}'${obj ? ` in ${shortenTxt(JSON.stringify(obj))}` : ""}`

type Diff<T, U> = T extends U ? never : T
export const hasFields = <T extends object>(obj: T, fields: (keyof T)[]): obj is { [K in (typeof fields[0])]: undefined extends T[K] ? T[K] : never } => {
    if (fields.length == 0) return true
    return fields.every(field => obj[field] != null)
}