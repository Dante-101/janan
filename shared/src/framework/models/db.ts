import { ObjKeys, RequiredKeys } from '../../common/types'
import { isObjectLiteral } from '../../common/validation'

export interface IdObj { id: string }

export type Id<T extends object> = T & IdObj
export type OptId<T extends object> = T & Partial<IdObj>    //optional ID
export type IdMap<T extends IdObj> = { [id: string]: Id<T> }
export type OptPersistable<T extends object> = T & Partial<PersistableObject>  //optional persistable data

export interface MetaObj { meta: Meta }
export interface PersistableObject extends IdObj, MetaObj { }

export type MetaKeyType = "meta.modified" | "meta.created"
export interface Meta {
    created: Date
    modified: Date
}

export enum SortOrder {
    ASCENDING = 1,
    DESCENDING = -1
}

export type InsertSpec<T extends object> = {
    objs: OptId<T>[]
    checkFieldsPresence?: RequiredKeys<T>[]
}

export const isInsertSpec = (spec: any): spec is InsertSpec<any> => isObjectLiteral(spec) && spec.objs && Array.isArray(spec.objs)

export type DbOneObjType<T extends object> = IdObj & T & Partial<MetaObj>

//Cannot restrict the fields because to query embedded documents, it needs to use dot notation. No other way.
//Having keyof T helps with auto complete
export type FilterSpec<T extends object> = { [K in keyof T]?: any } & { [K in MetaKeyType]?: any } & { [x: string]: any }
export type ProjectionSpec<T extends object> = { [K in keyof T]?: number } & { [x: string]: any }
export type SortSpec<T extends object> = { [K in keyof T]?: SortOrder } & { [K in MetaKeyType]?: SortOrder } & { [x: string]: SortOrder }

export interface CountSpec<T extends object> {
    filter?: FilterSpec<T>
    limit?: number
}

export interface FetchSpec<T extends object> {
    filter?: FilterSpec<T>
    project?: ProjectionSpec<T>
    skip?: number
    limit?: number
    sort?: SortSpec<T>
}

export interface UpdateSpec<T extends PersistableObject> {
    filter: FilterSpec<T>
    update: object
    options?: DbUpdateOptions
}

export interface UpsertSpec<T extends object> extends InsertSpec<T> {
    //for objs without id, values of fields from uniqueFieldSet is used to figure out the obj to update.
    // Combination of values of these fields should be unique
    uniqueFieldSet?: (ObjKeys<T>)[]
}

export interface ReplaceSpec<T extends object, U extends T & PersistableObject = T & PersistableObject> {
    filter: FilterSpec<U>
    replacement: OptPersistable<T>
}

export interface DeleteSpec<T extends PersistableObject> {
    filter?: FilterSpec<T>
    all?: boolean
}


export const makeUpdateSpec = <T extends PersistableObject>(id: string, newFields: Partial<T>): UpdateSpec<T> => {
    return {
        filter: { id } as FilterSpec<T>,
        update: { $set: newFields }
    }
}

//Result Objs
export interface InsertResult { insertedIds: string[] }
export interface UpsertResult {
    insertedCount: number
    updatedCount: number
    ids: string[]
}

export interface UpdateResult<T extends PersistableObject> {
    matchedCount: number
    modifiedCount: number
    //Updated obj is returned if matched and modified 1 object
    objs?: T[]
}

export type ReplaceResult<T extends object> = { obj: T }

export type UpdateOneObjResult<T extends object> = { obj: T }

export type DeleteResult = { deletedCount: number }
//export type UpsertResult<T extends PersistableObject> extends UpdateResult<T> { }
//Depending on the projection, T may not be PersistableObject
export type FetchResult<T extends object> = { objs: T[] }
export type CountResult = { count: number }
//If there is no obj with the id, obj is undefined
export type GetResult<T extends PersistableObject> = { obj: T | undefined }

interface DbMultiOption { multi?: boolean }
//export interface DbUpsertOptions { }
export interface DbUpdateOptions extends DbMultiOption {
    upsert?: boolean
}
export interface DbDeleteOptions extends DbMultiOption { }

export interface PersistableActionsModel<T extends object, U extends T & PersistableObject = T & PersistableObject> {
    get(obj: string | IdObj): Promise<GetResult<U>>

    //Inserts the object or the array of object and returns the generated ids in the same order
    insert(obj: InsertSpec<T>): Promise<InsertResult>

    //Used to find some object in the database. Returns the array of objects
    fetch(spec?: FetchSpec<U>): Promise<FetchResult<U>>

    //Used to count documents in the database. Returns the count
    count(spec?: CountSpec<U>): Promise<CountResult>

    //They will use this api
    //This is a lower level api
    update(spec: UpdateSpec<U>): Promise<UpdateResult<U>>

    //Uses update to update the provided obj and sets the values set in this obj except the meta fields.
    updateOneObj(obj: DbOneObjType<T>): Promise<UpdateOneObjResult<U>>

    //Updates the object if found else inserts it. Returns the array of ids of objects in the order the objects were provided.
    //Queries the database by the fields if 'id' is not present on the obj. 
    //If 0 objects are found, creates one. 
    //If 1 object is found, it replaces the whole object with obj.
    //If more than 1 object is found, it errors. 
    upsert(spec: UpsertSpec<T>): Promise<UpsertResult>

    //Takes a query and a replacement object. Replaces the object selected by query. Updates meta field.    
    replaceOne(spec: ReplaceSpec<T, U>): Promise<ReplaceResult<U>>

    //Uses replaceOne to replace the obj provided except the meta field of the obj. Filters by the id present in the obj.
    replaceOneObj(obj: DbOneObjType<T>): Promise<ReplaceResult<U>>

    delete(filter: object): Promise<DeleteResult>
}

export const removePersistable = <T>(objs: (T & Partial<{ id: any, meta: any }>)[], preserveId: boolean = false): T[] => {
    const a = objs.map(obj => {
        if (!preserveId)
            delete obj.id
        delete obj.meta
        return obj
    })
    return a
}