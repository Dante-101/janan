import { exec } from 'child_process'
import { cpus } from 'os'
import { ExtError } from 'shared/src/framework/error'
import { shortenTxt } from 'shared/src/common/transform'

export interface ProcessOut {
    err?: Error | null
    stdout?: string
    stderr?: string
}

export interface ExecCmdOptions {
    cwdDir?: string
    timeout?: number //Default is 5 mins; if equal to 0, disables timeout
    resolveOnError?: boolean
    maxBuffer?: number
    //To do any action on output
    postExecFn?: (out: ProcessOut) => void
}

export function execCmd(cmd: string, options?: ExecCmdOptions): Promise<ProcessOut> {
    const defaultTimeout = 300000
    options = options || { timeout: defaultTimeout }
    let { cwdDir, timeout, resolveOnError, postExecFn, maxBuffer } = options
    timeout = timeout == null ? defaultTimeout : timeout
    return new Promise<ProcessOut>((resolve, reject) => {
        exec(cmd, { cwd: cwdDir, timeout, maxBuffer, encoding: "utf8" }, function (err, stdout, stderr) {
            const processOut = { err, stdout, stderr }
            postExecFn && postExecFn(processOut)
            if (!resolveOnError && err) {
                return reject(new ExtError(shortenTxt(JSON.stringify(processOut)), "3RD_PARTY_ERROR", { prevErrors: err }))
            } else {
                return resolve(processOut)
            }
        })
    })
}

export const ioCmdConcurrency = 4
export const computeCmdConcurrency = Math.min(cpus().length, 4)