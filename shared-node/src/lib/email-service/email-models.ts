export interface RecipientsAddressInfo {
    to?: string[]
    cc?: string[]
    bcc?: string[]
}

//The model as it is stored on the Mongodb
//If successful, stores the job id, else stores the err
export interface EmailSourceAndDestination extends RecipientsAddressInfo {
    from: string
}

export interface ReturnAndReplyModel {
    replyTo?: string[]
    returnPath?: string
}

export interface EmailMessage {
    subject: string
    body: {
        text?: string
        html?: string
    }
}

export interface EmailModel extends EmailSourceAndDestination, ReturnAndReplyModel, EmailMessage { }

export interface EmailResponseModel extends EmailModel {
    messageId?: string
    errMsg?: string
}

export interface SendEmailResponse {
    messageId: string
}
