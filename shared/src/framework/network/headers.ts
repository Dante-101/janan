let _authToken: string | undefined
export const setGlobalAuthToken = (token: string | undefined = undefined) => { _authToken = token ? token : undefined }
export const getGlobalAuthToken = (): string | undefined => _authToken

export const jsonContentType = "application/json"
export const csvContentType = "text/csv"
// export type HttpContentType = typeof jsonContentType | typeof csvContentType
export type HttpContentType = typeof jsonContentType

export interface ApiReqHeaders {
    "Content-Type"?: HttpContentType
    Accept?: HttpContentType
    Authorization?: string
    host?: string
    //AWS headers
    //Taken from http://docs.aws.amazon.com/elasticloadbalancing/latest/classic/x-forwarded-headers.html
    'x-forwarded-proto'?: string
    'x-forwarded-for'?: string
    'x-forwarded-port'?: string
    'x-app-name'?: string
}

const commonDefaultHeaders: ApiReqHeaders = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}

export const defaultHeaders = (token?: string): ApiReqHeaders => {
    const reqToken = token || _authToken
    return reqToken ? { ...commonDefaultHeaders, Authorization: "Bearer " + reqToken } : commonDefaultHeaders
}

//Helpful for determining the origin app of the request. 
//Helps in debugging on the server through server logs
export const setReqHeaderXAppName = (appName: string) => { commonDefaultHeaders["x-app-name"] = appName }
export const setReqHeaderHost = (host: string) => { commonDefaultHeaders.host = host }

