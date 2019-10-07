import * as BPromise from 'bluebird'
import { createHash } from 'crypto'
import { createReadStream, createWriteStream, statSync } from 'fs-extra'
import * as glob from 'glob'
import { resolve as pathResolve } from 'path'
import { ExtError } from 'shared/src/framework/error'
import { Logger } from 'shared/src/framework/log'
import * as zlib from 'zlib'

const log = new Logger(__filename)

export const isDirectory = (filepath: string) => statSync(pathResolve(filepath)).isDirectory()
export const isFile = (filepath: string) => statSync(pathResolve(filepath)).isFile()

export interface ListFilesOptions {
    recursive?: boolean       //defaults to true
    exts?: string[]           //return file paths with these extensions, with excludeExts ON, it works the other way round
    excludeExts?: boolean     //if true, return the file paths except the extensions provided in exts. Default is false
}

export const listFiles = (srcPath: string, options?: ListFilesOptions): Promise<string[]> => {
    options = { recursive: true, ...options } || { recursive: true }
    const { recursive, exts, excludeExts } = options
    if (excludeExts && (!exts || exts.length == 0))
        throw new ExtError("Cannot 'excludeExts' without providing 'exts' in 'listFiles'", "INVALID_CONFIG")

    let globPattern = pathResolve(srcPath) + (recursive ? '/**/*' : '/*')
    if (exts && exts.length > 0) {
        //Creates pattern like '/**/*.@(js|cmd|md)' for including the extensions and '/**/*.!(js|cmd|md)' for negation
        const extPattern = `.${excludeExts ? "!" : "@"}(${exts.join("|")})`
        globPattern = globPattern + extPattern
    }

    return new Promise<string[]>((resolve, reject) => {
        glob(globPattern, function (err, files) {
            if (err) return reject(err)
            return resolve(files.filter(isFile))
        })
    })
}

export const listSubDirs = async (srcPath: string, recursive: boolean = true): Promise<string[]> =>
    new Promise<string[]>((resolve, reject) => {
        let globPattern = pathResolve(srcPath) + (recursive ? '/**/*' : '/*')
        glob(globPattern, function (err, files) {
            if (err) return reject(err)
            resolve(files.filter(isDirectory))
        })
    })

export const fileMd5Hash = async (filePath: string): Promise<string> =>
    new Promise<string>((resolve, reject) => {
        const hash = createHash('md5')
        const input = createReadStream(filePath)

        input.on('error', (err: Error) => reject(err))

        input.on('readable', () => {
            let data
            while ((data = input.read()) != null) {
                hash.update(data)
            }
        })
        input.on('end', () => resolve(hash.digest('hex')))
    })

export const fileMd5Hashes = async (fPaths: string[]): Promise<string[]> =>
    BPromise.map(fPaths, (fP, i) => fileMd5Hash(pathResolve(fP)), { concurrency: 7 })

export const createGzip = async (srcPath: string, destPath?: string): Promise<void> => {
    const newDestPath = destPath || srcPath + ".gz"
    if (!newDestPath.endsWith("gz"))
        throw new ExtError(`Gzip compressed file must end with 'gz'. Got path ${newDestPath}`, "INVALID_ARGUMENTS")

    return new Promise<void>((resolve, reject) => {
        const logObj = { message: 'compressing file', src: srcPath, dest: newDestPath }
        log.info({ ...logObj, status: 'start' })
        const gzip = zlib.createGzip()
        const input = createReadStream(srcPath)
        input.on('close', () => {
            log.info({ ...logObj, status: 'end' })
            resolve()
        })

        const out = createWriteStream(newDestPath)
        out.on('error', (err: Error) => reject(err))

        input.pipe(gzip).pipe(out)
    })
}