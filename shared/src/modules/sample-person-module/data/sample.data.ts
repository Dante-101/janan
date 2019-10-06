import { Id } from '../../../framework/models/db'
import { Name } from '../models/name'
import { Person } from '../models/person'

export const personData: Id<Person>[] = [
    {
        id: "09c8b59330194dcc",
        roles: ["customer"],
        name: Name.split("Dr. Gaurav Lahoti"),
        email: "gaurav@gl.com",
        isEmailVerified: true,
        phone: "1234567890",
        isPhoneVerified: true,
        timezone: "Asia/Calcutta"
    }
]