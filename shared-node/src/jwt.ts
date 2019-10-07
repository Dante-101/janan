import { sign, SignOptions, verify, VerifyCallback, VerifyOptions } from 'jsonwebtoken'
import { JwtRequestPayload, JwtTokenPayload } from 'shared/src/framework/models/auth'

export class Jwt {

    constructor(private _secret: string) { }

    sign({ pid, roles }: JwtRequestPayload, options: SignOptions = {}): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            sign({ pid, roles }, this._secret, { ...options }, (err: Error, token: string) => {
                if (err) { return reject(err) }
                return resolve(token)
            })
        })
    }

    signSync({ pid, roles }: JwtRequestPayload) {
        return sign({ pid, roles }, this._secret)
    }

    verify(token: string, options: VerifyOptions = {}): Promise<JwtTokenPayload> {
        return new Promise<JwtTokenPayload>((resolve, reject) => {
            const func = ((err: Error, payload: JwtTokenPayload) => {
                if (err) { return reject(err) }
                return resolve(payload)
            }) as VerifyCallback
            verify(token, this._secret, options, func)
        })
    }

    verifySync(token: string): JwtTokenPayload {
        return verify(token, this._secret) as JwtTokenPayload
    }
}