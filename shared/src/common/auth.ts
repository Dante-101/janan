import { isBrowser } from '../framework/env'
import { ExtError } from '../framework/error'
import { Logger } from '../framework/log'

const log = new Logger(__filename)

export const jwtTokenRegEx = /\w*\.\w*\.\w*/
export const isJwtToken = (token: string) => jwtTokenRegEx.test(token)

export const isAuthTokenExpired = (token: string) => {
    const parts = token.split(".")
    if (parts.length != 3) {
        throw new ExtError("Invalid JWT token", "INVALID_ARGUMENTS")
    }
    const b64 = parts[1]
    const objStr = isBrowser() ? atob(b64) : Buffer.from(b64, 'base64').toString()
    const obj = JSON.parse(objStr)
    if (obj.exp && typeof obj.exp == "number") {
        // log.info({ message: "Token Expiry time: " + new Date(obj.exp * 1000) })
        return new Date().getTime() > obj.exp * 1000
    }
    return false
}

export const authErrorMsg = "Invalid request"
export const noAuthTokenFoundMsg = "no authorization token"
export const notRegisteredMsg = (phone: string, type: string) => `Phone no '${phone}' is not registered with any ${type} account`