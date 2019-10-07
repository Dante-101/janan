import { readFileSync } from 'fs'
import { resolve } from 'path'
import { ExtError } from 'shared/src/framework/error'
import * as stripComments from 'strip-json-comments'

export const getJson = (filePath: string): any => {
    filePath = resolve(filePath)
    let str
    try {
        str = readFileSync(filePath).toString()
    } catch (e) {
        throw new ExtError(`Error reading JSON file from ${filePath}`, 'INVALID_ARGUMENTS', e)
    }

    let out: any
    try {
        out = JSON.parse(stripComments(str))
    } catch (e) {
        throw new ExtError(`Error parsing JSON ${str} from ${filePath} ${e.message}`, 'INVALID_ARGUMENTS', e)
    }
    return out
}

