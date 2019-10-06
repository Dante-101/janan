import { strEnum } from 'shared/src/common/types'

import { PersistableObject } from '../../../framework/models/db'
import { ContactModel } from './contact'
import { NameModel } from './name'
import { UserRoleType } from './roles'

export const GenderEnum = strEnum(["Male", "Female", "Prefer not to say"])
export type Gender = keyof typeof GenderEnum
export const GenderList = Object.keys(GenderEnum) as Gender[]

export interface Person extends ContactModel {
    name: NameModel
    roles: UserRoleType[]
    avatarImg?: string
    largeImg?: string
    age?: string
    dob?: number        //date represented as number
    gender?: Gender
    timezone?: string    //user's timezone
}

export interface PersonPersistable extends Person, PersistableObject { }

export interface PersonAuth {
    id: string      //person's id
    googleId?: string
    facebookId?: string
    salt?: string
    pwdHash?: string
}
export interface PersonAuthPersistable extends PersonAuth, PersonPersistable { }