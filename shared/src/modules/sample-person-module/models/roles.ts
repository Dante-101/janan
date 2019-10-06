import { firstLetterCapital } from '../../../common/transform'
import { strEnum } from '../../../common/types'
import { ExtError } from '../../../framework/error'

export const CustomerRoleEnum = strEnum(["customer"])
export type CustomerRoleType = keyof typeof CustomerRoleEnum
export const customerRoleList = Object.keys(CustomerRoleEnum) as CustomerRoleType[]
export const isCustomerRole = (str?: string): str is CustomerRoleType => !!str && customerRoleList.includes(str as CustomerRoleType)

export const EmployeeRoleEnum = strEnum(["marketing", "services"])
export type EmployeeRoleType = keyof typeof EmployeeRoleEnum
export const employeeRoleList = Object.keys(EmployeeRoleEnum) as EmployeeRoleType[]
export const isEmployeeRole = (str?: string): str is EmployeeRoleType => !!str && employeeRoleList.includes(str as EmployeeRoleType)
export const employeeRoleToTitle = (role: EmployeeRoleType) => {
    switch (role) {
        case "services":
        case "marketing":
            return firstLetterCapital(role)
        default: throw new ExtError(`Cannot create title for unknown employee role ${role}`, "INVALID_ARGUMENTS")
    }
}

export const AdminRoleEnum = strEnum(["admin"])
export type AdminRoleType = keyof typeof AdminRoleEnum
export const adminRoleList = Object.keys(AdminRoleEnum) as AdminRoleType[]
export const isAdminRole = (str?: string): str is AdminRoleType => !!str && adminRoleList.includes(str as AdminRoleType)

export type InternalRoleType = EmployeeRoleType | AdminRoleType
export const internalRoleList = [...employeeRoleList, ...adminRoleList]
export const isInternalRole = (str?: string): str is InternalRoleType => !!str && internalRoleList.includes(str as InternalRoleType)

export type UserRoleType = CustomerRoleType | InternalRoleType
export const userRoleList = [...customerRoleList, ...internalRoleList]
export const isUserRole = (str?: string): str is UserRoleType => !!str && userRoleList.includes(str as UserRoleType)