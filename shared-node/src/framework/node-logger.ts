import { mkdirp } from 'fs-extra'
import { dirname, resolve } from 'path'
import { LogLevel, StaticLogger } from 'shared/src/framework/log'
import * as winston from 'winston'

let _logFilePath: string | undefined
let _winstonLog: winston.Logger | undefined
const winstonLog = (): winston.Logger => {
    if (!_winstonLog) throw new Error("logger is not initialized. Use setLogFile to init the logger")
    return _winstonLog
}

export const setLogFile = (path: string, logLevel: LogLevel = "VERBOSE") => {
    _logFilePath = resolve(path)
    mkdirp(dirname(_logFilePath))
    //TODO: format
    _winstonLog = winston.createLogger({
        transports: [
            new winston.transports.File({
                level: logLevel.toLocaleLowerCase(),
                format: winston.format.combine(winston.format.json(), winston.format.colorize(), winston.format.timestamp()),
                filename: _logFilePath,
                handleExceptions: true,
                maxsize: 52428800 * 4, //200MB
                maxFiles: 5
            }),
            new winston.transports.Console({
                level: 'error',
                handleExceptions: true,
                format: winston.format.combine(winston.format.json(), winston.format.colorize(), winston.format.timestamp()),
            })
        ],
        exitOnError: false
        // stream: {
        //     write: function (message, encoding) {
        //         logger.info(message)
        //     }
        // }
    })

    //ToDo: Figure out what happens when logger it self emits errors
    _winstonLog.on('error', console.error)
}

type LogType = string | object

export const NodeLogger: StaticLogger = {
    verbose(log: LogType) {
        winstonLog().verbose({ message: log })
    },

    info(log: LogType) {
        winstonLog().info({ message: log })
    },

    warn(log: LogType) {
        winstonLog().warn({ message: log })
    },

    error(log: LogType) {
        winstonLog().error({ message: log })
    }
}

//To flush the winston logs and exit the application
export const logAndExit = (exitCode: number = 0) => {
    const logger = winstonLog()
    const numFlushes = logger.transports.length
    let numFlushed = 0
    const printNExit = () => {
        // console.log("Exiting process " + process.pid + " with code " + exitCode)
        process.exit(exitCode)
    }
    logger.transports.forEach(function (transport) {
        //TODO test
        transport.once("finish", function () {
            numFlushed += 1
            if (numFlushes === numFlushed) {
                printNExit()
            }
        })
    })
    if (numFlushes === 0) {
        printNExit()
    }
}