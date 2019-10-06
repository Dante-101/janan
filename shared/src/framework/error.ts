import { uniq } from 'lodash'

import { getGlobalLogger, StaticLogger } from './log'

export type ErrorType = Error | ExtError | ExtErrorSerModel

export interface ExtErrorSerModel {
    message: string
    errorCodes: ExtErrorCode[]
    httpStatus?: number
    stack?: string
    prevErrors?: ExtErrorSerModel[]
}

export interface ExtErrorOptions {
    prevErrors?: ErrorType | ErrorType[] | null
    log?: StaticLogger
}

/**
 * Our own class of error. Helps us accumulate errors
 * Can be used to persist errors and then send it over the network to our servers
 */
export interface ExtError extends ExtErrorSerModel { }

export class ExtError extends Error implements ExtErrorSerModel {
    constructor(message: string, errorCodes: ExtErrorCode | ExtErrorCode[], options?: ExtErrorOptions) {
        super(message)
        this.errorCodes = typeof errorCodes == 'string' ? [errorCodes] : uniq(errorCodes)
        this.name = this.constructor.name
        if (options) {
            const { prevErrors } = options
            if (prevErrors) {
                const errors = Array.isArray(prevErrors) ? prevErrors : [prevErrors]
                this.prevErrors = errors.map(ExtError.fromObj).map(o => o.toPlainObj()) //doing toPlainObj to ease serialization
                this.httpStatus = ExtError.findHttpStatus(this.prevErrors)
            }
        }
        if (ExtError._loggingEnabled) {
            const log = (options && options.log) ? options.log : getGlobalLogger()
            log.error({ message, codes: this.errorCodes })
        }
        //Taken from http://stackoverflow.com/questions/31089801/extending-error-in-javascript-with-es6-syntax
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor)
        } else {
            this.stack = new Error(this.message).stack
        }
    }

    private static _loggingEnabled = true
    static disableLogging = () => ExtError._loggingEnabled = false
    static enableLogging = () => ExtError._loggingEnabled = true

    private static findHttpStatus = (prevErrors: ExtErrorSerModel[]): number | undefined => {
        for (let i = 0; i < prevErrors.length; i++) {
            const e = prevErrors[i]
            if (e.httpStatus) {
                return e.httpStatus
            } else if (e.prevErrors) {
                const httpStatus = ExtError.findHttpStatus(e.prevErrors)
                if (httpStatus) { return httpStatus }
            }
        }
    }

    setHttpStatus = (code: number): ExtError => {
        this.httpStatus = code
        return this
    }

    toPlainObj(): ExtErrorSerModel {
        return {
            message: this.message,
            errorCodes: this.errorCodes,
            stack: this.stack,
            httpStatus: this.httpStatus,
            prevErrors: this.prevErrors
        }
    }

    static fromObj(err: string | ErrorType | undefined): ExtError {
        let defaultCode: ExtErrorCode[] = ["UNKNOWN_ERROR"]
        if (typeof err == 'string') {
            return new ExtError(err, defaultCode)
        } else if (err instanceof ExtError) {
            return err
        } else if (err instanceof Error) {
            const newE = new ExtError(err.message, defaultCode)
            newE.stack = err.stack
            return newE
        } else {
            //TODO: Check type of the fields before creating the error obj
            const codes: ExtErrorCode[] = (err && err.errorCodes) ? err.errorCodes : defaultCode
            //High chance message contains the error code already because ExtErrorSerModel is created by a ExtError
            const message = (err && err.message) ? err.message : "Unknown error"
            const newE = new ExtError(message, codes)
            newE.httpStatus = err ? err.httpStatus : undefined
            newE.stack = err ? err.stack : undefined
            return newE
        }
    }

    toString(): string {
        let errStr = ExtError.errToStr(this)
        if (this.prevErrors) {
            errStr = errStr + "\n\t" + this.prevErrors.map(ExtError.errToStr).join("\n\t")
        }
        return errStr
    }

    private static errToStr(err: ErrorType): string {
        const { message, errorCodes, httpStatus } = ExtError.fromObj(err)
        return `Error [${errorCodes.join(", ")}]: ${message}` + (httpStatus ? (". HttpStatus: " + httpStatus) : "")
    }
}

export type ExtErrorCode =
    "UNAUTHORIZED" |            //HTTP status 401 - authentication was unsuccessful
    "FORBIDDEN" |               //HTTP status 403 - authentication is successful but you cannot access the resource
    "INTERNAL_ERROR" |          //HTTP status 500 - used by server when some unexpected error came and you don't want to reveal the codes to the app (HTTP 500)

    //Function args/options issues
    "INVALID_OPTIONS" |         //'options' provided in the functions arguments are invalid
    "MISSING_OPTIONS" |         //field is missing in the provided 'options'
    "INVALID_ARGUMENTS" |       //'argument' values provided in the function is invalid
    "MISSING_ARGUMENTS" |       //required 'argument' is missing

    "INVALID_DATA" |            //when data expected from the disk/network is invalid
    "MISSING_DATA" |            //when data expected from the disk/network is missing

    "MISSING_QUERY_PARAMS" |    //when the network req data is 
    "INVALID_QUERY_PARAMS" |    //when the data supplied in the query is invalid
    "MISSING_CONFIG_PARAMS" |   //when the config given to a tool is missing required parameters
    "INVALID_CONFIG_PARAMS" |   //when the config given to a tool has invalid data in the params

    "INVALID_APP_STATE" |       //app state is invalid
    "INVALID_DB_STATE" |        //data in the database is in invalid state
    "INVALID_SERVER_STATE" |    //server state is invalid
    "INVALID_STATE" |           //used for shared code between app and server

    "INVALID_CONFIG" |          //when the config file or configuration passed is invalid
    "MISSING_CONFIG" |          //when the config file or configuration passed is missing

    "DB_ERROR" |                //all DB errors - the server couldn't connect to DB, or some index request was invalid or validator failed, etc.

    "NETWORK_ERROR" |           //e.g. canceled connections, internet is off, etc.

    "VERSION_CONFLICT" |        //version of some state or object is not same as expected and you cannot resolve it

    "UNKNOWN_ERROR" |           //cannot determine the error code of the error. mostly used to construct ExtError from Error

    "INVALID_PATH" |            //provided path to some file or resource is invalid
    "MISSING_PATH" |            //path to some required file or resource is not provided

    "3RD_PARTY_ERROR" |         //some 3rd party erred on some call

    "NO_MATCH" |                //missing match
    "INVALID_MATCH" |           //the match was found but was invalid for the type of requested operation

    "INVALID_CONFIG" |          //the configuration passed to the application (frontend/server/tool) is invalid

    "MISSING_MEDIA" |           //expected some media but it was not found

    "SERVICE_DISABLED"          //some server side service was disabled and some operation was requested