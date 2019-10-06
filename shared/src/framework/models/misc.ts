export interface HostAndToken {
    host: string
    //jwt token to use for authentication
    token: string
    //Is the host a domain like google.com (defaults to true). If it is false, the host is not validated.
    isDomain?: boolean
}
