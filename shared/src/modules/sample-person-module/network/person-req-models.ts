import { CustomerRoleType } from '../models/roles'

export interface CustomerRequest {
    pid: string
    role: CustomerRoleType
}