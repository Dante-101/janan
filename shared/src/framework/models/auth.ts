import { isPlainObject } from '../../common/validation'
import { UserRoleType } from '../../modules/sample-person-module/models/roles'

export const jwtTokenRegEx = /\w*\.\w*\.\w*/
export const isJwtToken = (token: string) => jwtTokenRegEx.test(token)

export interface JwtRequestPayload {
    pid: string
    roles: UserRoleType[]
}

export interface JwtTokenPayload extends JwtRequestPayload {
    iat?: number
}

export interface AuthVerify extends JwtRequestPayload {
    token: string
}

export interface PasswordSend {
    password: string
    type: UserRoleType
}

export interface MesiboToken {
    token: string
}

export const isJwtRequestPayload = (obj: Partial<JwtRequestPayload>): obj is JwtRequestPayload =>
    isPlainObject(obj) && !!obj.pid && !!obj.roles

export const isAuthVerify = (obj: Partial<AuthVerify>): obj is AuthVerify =>
    isPlainObject(obj) && !!obj.token && isJwtRequestPayload(obj)