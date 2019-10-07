import * as request from 'request-promise'
import { shortenTxt } from 'shared/src/common/transform'
import { ExtError } from 'shared/src/framework/error'
import { Logger } from 'shared/src/framework/log'
import {
    ApiClientRequest,
    processResponseBodyStr,
    RespStatusBody,
    validateApiClientRequest,
} from 'shared/src/framework/network/api-client'
import { defaultHeaders } from 'shared/src/framework/network/headers'
import { URL } from 'url'

const log = new Logger(__filename)

export async function NodeApiClient<T extends object>(reqObj: ApiClientRequest): Promise<RespStatusBody<T>> {
    validateApiClientRequest(reqObj)
    const { host, urlPath, method, headers, body } = reqObj
    if (!host) { throw new ExtError("Host required for NodeApiClient", "INVALID_ARGUMENTS") }
    let errStr = () => `${host + urlPath} ${body ? (" with body " + shortenTxt(JSON.stringify(body))) : ""}`
    let reqOptions = makeRequestPromiseOptions(reqObj)
    log.verbose({ message: `Accessing request ${shortenTxt(JSON.stringify(reqOptions))}` })
    let response
    try {
        response = await request(reqOptions)
    } catch (err) {
        throw new ExtError(`Network error in fetching ${errStr()}`, "NETWORK_ERROR", err)
    }

    let status = response.statusCode
    if (status == null) {
        throw new ExtError(`No status returned by call ${errStr()}`, "MISSING_DATA")
    }
    return processResponseBodyStr<T>(response.body, status, response.headers["content-type"])
}


const makeRequestPromiseOptions = (req: ApiClientRequest): request.OptionsWithUrl => {
    const { host, urlPath, method, body, headers } = req
    let updatedHost = (host || "").trim()
    if (updatedHost) {
        updatedHost = (new URL(updatedHost)).origin
    }
    return {
        url: (updatedHost ? updatedHost : "") + (urlPath),
        method,
        headers: headers || defaultHeaders,
        body: JSON.stringify(body),
        json: false,
        resolveWithFullResponse: true,
        simple: false
    }
}