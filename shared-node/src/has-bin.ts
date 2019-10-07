import * as BPromise from 'bluebird'
import { ExtError } from 'shared/src/framework/error'

const hasbin = require('hasbin')

const hasBinPromise = (bin: string) =>
new Promise<void>((resolve, reject) => {
    hasbin(bin, (res: boolean) => {
        if (!res) return reject(new ExtError(`Command ${bin} is not available. Please install.`, "INVALID_PATH"))
        return resolve()
    })
})

export const hasBinaries = async (binaries: string[]) => await BPromise.map(binaries, hasBinPromise, { concurrency: 10 })