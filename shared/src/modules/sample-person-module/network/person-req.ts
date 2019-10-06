import { GetResult } from '../../../framework/models/db'
import { apiRequest } from '../../../framework/network/api-client'
import { CrudRequest } from '../../../framework/network/crud'
import { Person, PersonAuth, PersonPersistable } from '../models/person'
import { CustomerRequest } from './person-req-models'

export const getPersonCrud = (host?: string, token?: string) =>
    new CrudRequest<Person>(UrlClassName.person, host, token)
export const personCrud = getPersonCrud()

export const getPersonReq = (req: CustomerRequest, host?: string) =>
    apiRequest<GetResult<PersonPersistable>>(ApiUrlPath.getPerson, req, host)


export const getPersonAuthCrud = (host?: string, token?: string) =>
    new CrudRequest<PersonAuth>(UrlClassName.personAuth, host, token)
export const personAuthCrud = getPersonAuthCrud()