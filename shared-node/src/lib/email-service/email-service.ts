import { SES } from 'aws-sdk'
import { validateFieldsPresence } from 'shared/src/common/validation'
import { ExtError } from 'shared/src/framework/error'
import { Logger } from 'shared/src/framework/log'
import { promisify } from 'util'

import { EmailModel, EmailResponseModel } from './email-models'

const log = new Logger(__filename)

export class EmailService {
    private awsSes: SES
    private sendEmailPromise: (req: SES.SendEmailRequest) => Promise<SES.SendEmailResponse>

    constructor(private isDisabled?: boolean) {
        this.awsSes = new SES({
            apiVersion: '2010-12-01',
            region: "us-east-1"
        })

        this.sendEmailPromise = promisify<SES.SendEmailRequest, SES.SendEmailResponse>(this.awsSes.sendEmail.bind(this.awsSes))
    }

    private emailReqObj(emailModel: EmailModel, supportEmailAddr: string): SES.Types.SendEmailRequest {
        const { body, subject, from, to, cc, bcc, replyTo, returnPath } = emailModel
        if (!(body.text || body.html)) {
            throw new ExtError(`either text or html need to be provided in body of email`, "MISSING_DATA")
        }
        let Body: SES.Types.Body = body.text ? { Text: { Data: body.text } } : {}
        Body = body.html ? { ...Body, Html: { Data: body.html } } : Body
        return {
            Source: from,
            Destination: {
                ToAddresses: to,
                CcAddresses: cc,
                BccAddresses: bcc
            },
            Message: {
                Subject: { Data: subject },
                Body
            },
            ReplyToAddresses: replyTo || [supportEmailAddr],
            ReturnPath: returnPath || supportEmailAddr
        }
    }

    async sendEmail(emailModel: EmailModel, supportEmailAddr: string): Promise<string> {
        if (this.isDisabled) { throw new ExtError("Email service is disabled", "SERVICE_DISABLED") }
        validateFieldsPresence([emailModel], ["from", "subject", "body"])
        const { MessageId: messageId } = await this.sendEmailPromise(this.emailReqObj(emailModel, supportEmailAddr))
        const respObj: EmailResponseModel = { ...emailModel, messageId }
        log.info({ action: "sent-email", ...respObj })
        return messageId
    }
}

export const emailSenderString = (name: string, email: string) => `${name} <${email}>`

