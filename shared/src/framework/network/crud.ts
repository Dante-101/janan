import { strEnum } from '../../common/types'
import {
    CountResult,
    CountSpec,
    DbOneObjType,
    DeleteResult,
    DeleteSpec,
    FetchResult,
    FetchSpec,
    GetResult,
    IdObj,
    InsertResult,
    InsertSpec,
    OptId,
    PersistableActionsModel,
    PersistableObject,
    ReplaceResult,
    ReplaceSpec,
    UpdateOneObjResult,
    UpdateResult,
    UpdateSpec,
    UpsertResult,
    UpsertSpec,
} from '../models/db'
import { getGlobalApiClient, makeApiClientReqObj } from './api-client'
import { ApiUrl } from './api-url'
import { jsonContentType } from './headers'

export const CrudReqActionEnum = strEnum(["insert", "get", "fetch", "count", "update", "upsert", "update-one-obj", "replace-one", "replace-one-obj", "delete"])
export type CrudReqActionType = keyof typeof CrudReqActionEnum
export const crudReqActionList = Object.keys(CrudReqActionEnum) as CrudReqActionType[]
export const crudReqActionRegex = new RegExp(`^\/api\/\\d+\/[\\w-]+/(${crudReqActionList.join("|")})`)

export class CrudRequest<T extends object, U extends T & PersistableObject = T & PersistableObject> implements PersistableActionsModel<T, U> {
    constructor(private restUrlClassName: string, private host?: string, private authToken?: string) { }

    //Returns the body of the response if it was successful
    private makeCrudReq = async <T extends object>(body: object, crudOp: CrudReqActionType): Promise<T> => {
        const urlPath = ApiUrl.v1(this.restUrlClassName, crudOp)
        const reqObj = makeApiClientReqObj(urlPath, body, undefined, this.host, this.authToken)
        reqObj.headers.Accept = jsonContentType
        const apiClient = getGlobalApiClient()
        const response = await apiClient<T>(reqObj)
        return response.body
    }

    get = (obj: string | IdObj): Promise<GetResult<U>> => {
        obj = { id: typeof obj == 'object' ? obj.id : obj }
        return this.makeCrudReq<GetResult<U>>(obj, CrudReqActionEnum.get)
    }

    insert = (spec: InsertSpec<T>): Promise<InsertResult> => this.makeCrudReq<InsertResult>(spec, CrudReqActionEnum.insert)
    insertObjs = (objs: OptId<T>[]): Promise<InsertResult> => this.insert({ objs })
    insertOneObj = (obj: OptId<T>): Promise<InsertResult> => this.insert({ objs: [obj] })

    fetch = (fetchSpec: FetchSpec<U>): Promise<FetchResult<U>> => {
        return this.makeCrudReq<FetchResult<U>>(fetchSpec, CrudReqActionEnum.fetch)
    }

    count = (spec: CountSpec<U>): Promise<CountResult> => {
        return this.makeCrudReq<CountResult>(spec, CrudReqActionEnum.count)
    }

    update = (updateSpec: UpdateSpec<U>): Promise<UpdateResult<U>> => this.makeCrudReq<UpdateResult<U>>(updateSpec, CrudReqActionEnum.update)
    updateOneObj = (obj: DbOneObjType<T>) => this.makeCrudReq<UpdateOneObjResult<U>>(obj, CrudReqActionEnum["update-one-obj"])

    upsert = (spec: UpsertSpec<T>): Promise<UpsertResult> => this.makeCrudReq<UpsertResult>(spec, CrudReqActionEnum.upsert)

    replaceOne = (spec: ReplaceSpec<T, U>): Promise<ReplaceResult<U>> => this.makeCrudReq<ReplaceResult<U>>(spec, CrudReqActionEnum["replace-one"])
    replaceOneObj = (obj: DbOneObjType<T>): Promise<ReplaceResult<U>> => this.makeCrudReq<ReplaceResult<U>>(obj, CrudReqActionEnum["replace-one-obj"])

    delete = (spec: DeleteSpec<U>): Promise<DeleteResult> => this.makeCrudReq<DeleteResult>(spec, CrudReqActionEnum.delete)
    deleteAll = (): Promise<DeleteResult> => this.delete({ all: true })
}