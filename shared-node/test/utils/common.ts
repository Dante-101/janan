import { expect } from 'chai'
import { PersistableObject } from 'shared/src/framework/models/db'

export const validateExceptPersistableFields = <T>(actual: T & PersistableObject, expected: T, ignoreFields: (keyof T)[] = []) => {
    const fieldsToIgnore = [...ignoreFields, "id", "meta"]
    const fieldsToCheck = Object.keys(actual).filter(field => fieldsToIgnore.indexOf(field) == -1)
    fieldsToCheck.forEach(field => expect((<any>actual)[field]).to.deep.eq((<any>expected)[field]))
}