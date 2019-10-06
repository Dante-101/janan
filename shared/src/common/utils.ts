import { Chance } from 'chance'
import { range } from 'lodash'
import { SortOrder } from 'src/framework/models/db'

import { ExtError } from '../framework/error'

const chance = new Chance()

export const sortObjsByDate = <T>(objs: T[], dateMap: (obj: T) => string | Date, order: SortOrder = SortOrder.ASCENDING): T[] => {
    return [...objs].sort((obj1: T, obj2: T) => {
        let date1 = dateMap(obj1)
        let date2 = dateMap(obj2)
        let d1 = (typeof date1 == 'string') ? new Date(date1) : date1
        let d2 = (typeof date2 == 'string') ? new Date(date2) : date2
        return (d1 > d2) ? order : (d1 < d2) ? -order : 0
    })
}

export const xor2Val = (a: any, b: any): boolean => {
    a = !!a
    b = !!b
    return (a || b) && (!a || !b)
}

export const mergeArray = <T>(objs: T[], mergeFunc: (obj1: T, obj2: T) => T): T => {
    if (!objs || objs.length == 0) { throw new ExtError("No objs to merge", "INVALID_ARGUMENTS") }
    let startObj = Object.assign({}, objs[0])
    if (objs.length == 1) { return startObj }
    return objs.slice(1).reduce(mergeFunc, startObj)
}

export const randomizeName = (name: string) => name + "-" + Math.floor(Math.random() * 1e6)

export const genRandomAlphaNumeric = (length: number): string => {
    const allowedCharArr = [
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B",
        "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N",
        "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
    ]
    return range(0, length).reduce<string>((res, num) => res + chooseRandom(allowedCharArr), "")
}

export const genRandomInteger = (min: number, max: number) => chance.integer({ min, max })

export const chooseRandom = <T>(arr: T[]): T => arr[genRandomInteger(0, arr.length - 1)]

export const delayedPromise = <T>(func: () => Promise<T>, time: number = 100): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
        setTimeout(() => { func().then(r => resolve(r)).catch(e => reject(e)) }, time)
    })
}

export const addDelay = (time: number) => delayedPromise(() => Promise.resolve(), time)