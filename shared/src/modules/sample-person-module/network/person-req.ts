import { CrudRequest } from '../../../framework/network/crud'
import { Person } from '../models/person'

export const getPersonCrud = (host?: string, token?: string) =>
    new CrudRequest<Person>(ApiModuleName.person, host, token)
export const personCrud = getPersonCrud()

// export const getPersonAuthCrud = (host?: string, token?: string) =>
//     new CrudRequest<PersonAuth>(ApiUrModuleName.person, host, token)
// export const personAuthCrud = getPersonAuthCrud()