import { ExtError } from '../../framework/error'
import { Logger } from '../../framework/log'

export interface RetryPromiseOptions {
    //defaults to 3
    maxRetry: number
    //defaults to 500
    minWaitTime: number
    //defaults to 2500
    maxWaitTime: number,
    logger: Logger
}

const DefaultRetryPromiseOptions: RetryPromiseOptions = {
    maxRetry: 50,
    minWaitTime: 1000,
    maxWaitTime: 3000,
    logger: new Logger(__filename)
}

/**
 * When retry is 0, executes the func with a 0 timeout. Else it gives a timeout between options.minWaitTime and options.maxWaitTime.
 * @param execFunc Function that the retryPromise executes
 * @param errorCondition executes on the rejected value of the execFunc. If true, retryPromise retries, else it rejects
 * @param retry retry count
 * @param options configuration options for retry
 */
export const retryPromise = async <T>(
    execFunc: (retry?: number) => Promise<T>,
    errorCondition: (error?: Error) => boolean,
    options: Partial<RetryPromiseOptions> = DefaultRetryPromiseOptions,
    retry: number = 0): Promise<T> => {

    return new Promise<T>((resolve, reject) => {
        let newOptions: RetryPromiseOptions = { ...DefaultRetryPromiseOptions, ...options }
        const { maxRetry, minWaitTime, maxWaitTime, logger } = newOptions

        if (retry > maxRetry) {
            return reject(new ExtError(`Retry ${retry} exceeded max retry ${maxRetry}`, "INVALID_ARGUMENTS"))
        }
        let time = retry == 0 ? 0 : (minWaitTime + Math.round(Math.random() * (maxWaitTime - minWaitTime)))

        let handleError = (error: Error) => {
            logger.verbose({ action: 'retry-error', retry, message: error.message })
            if (errorCondition(error) && (retry + 1) <= maxRetry) {
                retryPromise(execFunc, errorCondition, options, retry + 1)
                    .then(res => resolve(res))
                    .catch(err => reject(err))
            } else {
                reject(error)
            }
        }

        let timeOutFunc = () => {
            logger.verbose({ action: 'retrying', retry })
            execFunc(retry)
                .then(res => resolve(res))
                .catch(handleError)
        }
        global.setTimeout(timeOutFunc, time)
    })
}
