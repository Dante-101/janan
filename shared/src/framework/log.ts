import { strEnum } from '../common/types'
import { isDev, isProd } from './env'
import { ExtError } from './error'

export const LogLevelEnum = strEnum(["VERBOSE", "INFO", "WARN", "ERROR"])
export type LogLevel = keyof typeof LogLevelEnum
export const logLevelList: LogLevel[] = Object.keys(LogLevelEnum) as LogLevel[]
export const isLogLevel = (type?: string): type is LogLevel => !!type && logLevelList.includes(type as LogLevel)

export type LogType = string | object

//To define the core logger functionalities
//Before the application starts, need to setup the logger
export interface StaticLogger {
    error(log: LogType): void
    warn(log: LogType): void
    info(log: LogType): void
    verbose(log: LogType): void
}

//The set logger is stored here
let _logger: StaticLogger | undefined
let _logLevel: LogLevel = ((): LogLevel => {
    if (isProd)
        return "WARN"
    if (isDev)
        return "WARN"
    return "VERBOSE"
})()

export const setGlobalLogLevel = (level: LogLevel) => {
    //Introducing a check because even browsers can execute this function globally
    if (logLevelList.indexOf(level) == -1) throw new ExtError("Invalid level for logger " + level, "INVALID_ARGUMENTS")
    _logLevel = level
}
export const getGlobalLogLevel = () => _logLevel

//At the start of your application, set this.
export const setGlobalLogger = (logger: StaticLogger) => { _logger = logger }
export const getGlobalLogger = (): StaticLogger => {
    if (!_logger) throw new ExtError("No logger setup", "INVALID_CONFIG")
    return _logger
}

export class Logger implements StaticLogger {
    constructor(public context: string, public commonLog: object = {}, public localLogLevel?: LogLevel) {
        if (!_logger) {
            throw new ExtError("Need a logger to boot the application", "INVALID_CONFIG")
        }
    }

    private addContext(log: LogType) {
        if (typeof log == 'string') {
            return { message: log, context: this.context }
        } else {
            return { ...this.commonLog, ...log, context: this.context }
        }
    }

    setCommon(log: object) {
        this.commonLog = log
    }

    verbose(log: LogType) {
        if (logLevelList.indexOf(this.localLogLevel || _logLevel) == 0)
            getGlobalLogger().verbose(this.addContext(log))
    }

    info(log: LogType) {
        if (logLevelList.indexOf(this.localLogLevel || _logLevel) <= 1)
            getGlobalLogger().info(this.addContext(log))
    }

    warn(log: LogType) {
        if (logLevelList.indexOf(this.localLogLevel || _logLevel) <= 2)
            getGlobalLogger().warn(this.addContext(log))
    }

    error(log: LogType) {
        getGlobalLogger().error(this.addContext(log))
    }

    static verbose(log: LogType) {
        getGlobalLogger().verbose(log)
    }

    static info(log: LogType) {
        getGlobalLogger().info(log)
    }

    static warn(log: LogType) {
        getGlobalLogger().warn(log)
    }

    static error(log: LogType) {
        getGlobalLogger().error(log)
    }
}