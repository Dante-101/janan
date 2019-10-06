import { is2xx } from 'shared/src/common/validation'

import { isDemo, isNode } from '../env'
import { ExtError } from '../error'
import { ApiReqHeaders, defaultHeaders, jsonContentType } from './headers'

/**
 * It should reject on all non 200 HTTP status
 */
export type ApiClientType = <T extends object>(reqObj: ApiClientRequest) => Promise<RespStatusBody<T>>

let _apiClient: ApiClientType | undefined
//At the start of your application, set these
export const setGlobalApiClient = (apiClient: ApiClientType) => { _apiClient = apiClient }
export const getGlobalApiClient = (): ApiClientType => {
    if (!_apiClient) { throw new ExtError(`Global ApiClient not set`, "INVALID_STATE") }
    if (isDemo) { throw new ExtError(`Api clients are disabled in demo`, "INVALID_APP_STATE").setHttpStatus(400) }
    return _apiClient
}

//Used by nodejs services/tests (also useful in case we create a sub-domain for api requests)
let _apiHost = process.env.API_HOST || ""
export const setGlobalApiHost = (host: string | undefined = undefined, isDomain: boolean = true) => {
    _apiHost = host ? validateAndGetHostOrigin(host, isDomain) : ""
}
export const getGlobalApiHost = () => _apiHost

export interface ApiClientRequest {
    host?: string
    urlPath: string             //doesn't include the host
    method: "POST" | "GET"
    body?: object
    headers: ApiReqHeaders
}

export const makeApiClientReqObj = (url: string, body: object, headers?: ApiReqHeaders, host?: string, authToken?: string): ApiClientRequest => {
    const reqHeaders = headers || defaultHeaders(authToken)
    host = host || getGlobalApiHost()
    return { urlPath: url, method: 'POST', body, host, headers: reqHeaders }
}

export const apiRequest = async <Response extends object>(url: string, body: object, host?: string, authToken?: string): Promise<Response> => {
    const reqObj = makeApiClientReqObj(url, body, undefined, host, authToken)
    const client = getGlobalApiClient()
    return (await client<Response>(reqObj)).body
}

export const validateApiClientRequest = (reqObj: ApiClientRequest) => {
    const { host, urlPath: urlPath, method, headers, body } = reqObj
    let errMsg: string[] = []
    if (isNode() && !host) errMsg.push("Need host to process the request")
    if (method == "GET" && body) errMsg.push("Body should not be specified with method GET")
    if (method != "POST" && method != "GET") errMsg.push(`Unsupported req obj method ${method}`)
    if (!urlPath)
        if (errMsg.length > 0) {
            throw new ExtError(errMsg.join("\n"), "INVALID_ARGUMENTS")
        }
}

export interface RespStatusBody<T> {
    status: number,
    body: T
}

export const processResponseBodyStr = <T extends object>(responseStr: string = "{}", status: number, responseContentType: string | null): RespStatusBody<T> => {
    if (!responseContentType || responseContentType.indexOf(jsonContentType) == -1) {
        throw new ExtError(`Api Client cannot process content type '${responseContentType}'. It only accepts '${jsonContentType}'.`, "INVALID_ARGUMENTS")
    }
    if (typeof responseStr != 'string') {
        throw new ExtError(`Api response has to be string. It is currently '${typeof responseStr}'.`, "INVALID_ARGUMENTS")
    }

    let resp: any
    try {
        resp = JSON.parse(responseStr)
    } catch (e) {
        throw new ExtError("Unable to parse response json", "INVALID_DATA", e).setHttpStatus(status)
    }

    if (!is2xx(status)) {
        throw ExtError.fromObj(resp).setHttpStatus(status)
    }

    return { status: status, body: resp as T }
}

//https://stackoverflow.com/a/16491074
const isValidDomain = (host?: string): boolean => {
    const regex = /^(?!\-)(?:[a-zA-Z\d\-]{0,62}[a-zA-Z\d]\.){1,126}(?!\d+)[a-zA-Z\d]{1,63}$/
    return !!(host && regex.test(host))
}


/**
 * const url = new URL("http://userid:mypassword@localhost:4000/random?q=mysearch#topic")
 * gives an object with following values
 * hash:"#topic"
 * host:"localhost:4000"
 * hostname:"localhost"
 * href:"http://userid:mypassword@localhost:4000/random?q=mysearch#topic"
 * origin:"http://localhost:4000"
 * password:"mypassword"
 * pathname:"/random"
 * port:"4000"
 * protocol:"http:"
 * search:"?q=mysearch"
 * searchParams:URLSearchParams
 * username:"userid"
 */
export const validateAndGetHostOrigin = (host: string, isDomain: boolean = true) => {
    const url = new URL(host)
    if (isDomain && !url.protocol.startsWith("http")) {
        throw new ExtError(`Unknown host protocol '${url.protocol}'`, "INVALID_DATA")
    }
    if (isDomain && !isValidDomain(url.hostname)) {
        throw new ExtError(host + " is not a valid host name", "INVALID_DATA")
    }
    return url.origin
}