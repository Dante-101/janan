import { isEqual } from 'lodash'

import { firstLetterCapital } from '../../../common/transform'
import { strEnum } from '../../../common/types'
import { ExtError } from '../../../framework/error'

const NameTitlesEnum = strEnum(["mr", "mr.", "ms", "ms.", "mrs", "mrs.", "dr", "dr.", "er", "er.", "ca", "professor", "prof.", "prof"])
type NameTitlesType = keyof typeof NameTitlesEnum
const NameTitlesArr = Object.keys(NameTitlesEnum) as NameTitlesType[]
const isNameTitle = (str: string): str is NameTitlesType => !!str && NameTitlesArr.indexOf(str.trim().toLocaleLowerCase() as NameTitlesType) != -1

//After retrieving from DB, these values may be set to null
export interface NameModel {
    title?: NameTitlesType | null
    firstName: string
    middleNames?: string[] | null
    lastName?: string | null
}

export interface Name extends NameModel { }

export class Name implements NameModel {
    constructor(name: NameType) {
        const nameModel = Name.toNameModel(name)
        if (!nameModel.firstName) { throw new ExtError(`Cannot determine firstName for name '${name}'`, "INVALID_ARGUMENTS") }
        this.title = nameModel.title
        this.firstName = nameModel.firstName
        this.middleNames = nameModel.middleNames
        this.lastName = nameModel.lastName
    }

    formattedFullName = () => Name.formattedFullName(this)
    isEqual = (name: NameModel) => Name.areNamesEqual(this, name)

    toPlainObj = (): NameModel => ({
        title: this.title,
        firstName: this.firstName,
        middleNames: this.middleNames,
        lastName: this.lastName
    })

    static toNameModel = (name: NameType): Partial<NameModel> => {
        if (typeof name == "string") return Name.split(name)
        if (name instanceof Name) return name.toPlainObj()
        return name
    }

    static split = (nameStr: string): NameModel => {
        nameStr = nameStr.trim()
        if (!nameStr) { throw new ExtError("Name cannot be empty", "INVALID_ARGUMENTS") }
        let nameParts = nameStr.split(" ").map(part => part.trim().toLocaleLowerCase()).filter(part => part)
        let firstPart = nameParts[0]
        let name: NameModel
        if (isNameTitle(firstPart) && nameParts.length > 1) {
            name = {
                title: firstPart,
                firstName: nameParts[1]
            }
            nameParts = nameParts.slice(2)
        } else {
            name = { firstName: nameParts[0] }
            nameParts = nameParts.slice(1)
        }

        if (nameParts.length > 0) {
            name.lastName = nameParts[nameParts.length - 1]
            if (nameParts.length > 1) {
                name.middleNames = nameParts.slice(0, nameParts.length - 1)
            }
        }
        return name
    }

    static formattedFullName = ({ title, firstName, middleNames, lastName }: Partial<Name>): string | undefined => {
        if (firstName) {
            const nameArr: string[] = title ? [firstLetterCapital(title)] : []
            nameArr.push(firstLetterCapital(firstName))
            if (middleNames && middleNames.length > 0) {
                nameArr.push(...middleNames.map(name => firstLetterCapital(name)).filter(val => val))
            }
            if (lastName) {
                nameArr.push(firstLetterCapital(lastName))
            }
            return nameArr.join(" ")
        }
    }

    static areNamesEqual = (name1: NameType, name2: NameType): boolean => {
        return isEqual(Name.toNameModel(name1), Name.toNameModel(name2))
    }
}

type NameType = string | Partial<NameModel> | Partial<Name>