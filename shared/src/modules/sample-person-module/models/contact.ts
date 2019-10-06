import { ExtError } from '../../../framework/error'
import { isValidEmail, isValidPhoneNumber } from '../../../common/validation'

export interface ContactModel {
    email: string
    isEmailVerified?: boolean | null
    phone?: string | null
    isPhoneVerified?: boolean | null
    address?: AddressModel | null    
}

export interface AddressModel {
    flatBuilding?: string
    locality?: string
    city?: string
    zip?: string
    state?: string
    country?: string
}

export const validateContactInfo = (contact: Partial<ContactModel>) => {
    const { phone, email } = contact
    if (phone && !isValidPhoneNumber(phone)) {
        throw new ExtError(`Invalid phone number '${phone}'`, "INVALID_DATA")
    }

    if (email && !isValidEmail(email)) {
        throw new ExtError(`Invalid email found '${email}'`, "INVALID_DATA")
    }
}