import { S3 } from 'aws-sdk'
import { contentType } from 'mime-types'
import { ExtError } from 'shared/src/framework/error'
import { basename } from 'path';

export const SIGNED_URL_EXPIRY_DURATION = 24 * 60 * 60  //1 day in seconds

export class S3Utils {
    private _s3: S3

    constructor(config?: S3.Types.ClientConfiguration) {
        this._s3 = new S3({ apiVersion: '2006-03-01', signatureVersion: "v4", ...config })
    }

    async uploadSignedUrl(bucket: string, s3Key: string): Promise<string> {
        const fileContentType = contentType(basename(s3Key))
        const uploadParams = {
            Bucket: bucket,
            Key: s3Key,
            Expires: SIGNED_URL_EXPIRY_DURATION,
            ContentType: fileContentType || ""
        }
        return new Promise<string>((resolve, reject) => {
            this._s3.getSignedUrl('putObject', uploadParams, (e, url) => {
                if (e) { return reject(new ExtError(`Cannot create upload signed url for bucket ${bucket} and key ${s3Key}`, "3RD_PARTY_ERROR", { prevErrors: e })) }
                resolve(url)
            })
        })
    }

    async downloadSignedUrl(bucket: string, s3Key: string): Promise<string> {
        const downloadParams = {
            Bucket: bucket,
            Key: s3Key,
            Expires: SIGNED_URL_EXPIRY_DURATION
        }
        return new Promise<string>((resolve, reject) => {
            this._s3.getSignedUrl('getObject', downloadParams, (e, url) => {
                if (e) { return reject(new ExtError(`Cannot create download signed url for bucket ${bucket} and key ${s3Key}`, "3RD_PARTY_ERROR", { prevErrors: e })) }
                resolve(url)
            })
        })
    }

    async hasKey(bucket: string, s3Key: string): Promise<boolean> {
        try {
            await this._s3.headObject({ Bucket: bucket, Key: s3Key }).promise()
            return true
        } catch (e) {
            return false
        }
    }
}