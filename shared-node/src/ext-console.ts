import * as colors from 'colors/safe'

//Extended Console to print sentences to the console in colors instead of the actual logs which go into the log file
//Used by cli based tools to print beautiful stuff
export const ExtConsole = {
    //Used when you are starting some action like downloading
    start: (message: string) => { console.log(colors.yellow(message)) },
    //Used when the action is successful
    success: (message: string) => { console.log(colors.green(message)) },
    //When some error happens
    error: (message: string) => { console.error(colors.bgRed(message)) },
    //When a set of tasks are all done. Used usually at the end of the tool. Right now, colors are same as info
    complete: (message: string, context?: string) => { console.log(colors.cyan(message + `\nCompleted ${context ? context + " " : ""}at: ` + new Date().toLocaleString())) },

    //Normal logging to console
    log: (message: string) => { console.log(message) },
    info: (message: string) => { console.log(colors.cyan(message)) },
    warn: (message: string) => { console.warn(colors.bgYellow(message)) },
}