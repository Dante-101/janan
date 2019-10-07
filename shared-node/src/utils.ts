import { ExtError } from 'shared/src/framework/error'

import { getJson } from './get-json'

const findConfigFile = (argument: string) => {
    return process.argv.find(param =>
        param.trim().startsWith(argument + "=") &&
        param.trim().endsWith(".json"))
}

export const hasConfigFile = (argument: string): boolean => {
    return !!findConfigFile(argument)
}

export const getConfigFromFile = (argument: string): any => {
    const configArg = findConfigFile(argument)
    if (!configArg) throw new ExtError("Missing config argument: " + argument, "INVALID_ARGUMENTS")
    
    return getJson(configArg.replace(argument + "=", "").trim())
}