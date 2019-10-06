/** Utility function to create a K:V from a list of strings */
export const strEnum = <T extends string>(o: Array<T>): { [K in T]: K } =>
    o.reduce((res, key) => {
        res[key] = key
        return res
    }, Object.create(null))

const EnumExample = strEnum(["A", "B", "C"])
type enumKeys = keyof typeof EnumExample

// //Taken from https://github.com/Microsoft/TypeScript/issues/12215#issuecomment-307871458
// export type ObjOmit<T extends object, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
// export type ObjKeys<T extends object> = Extract<keyof T, string | number>

// //Examples
// interface S {
//     a: string
//     b: number
//     c: Symbol
// }
// type C = ObjOmit<S, "a">

// interface If {
//     a: string
//     c: object
//     d: number
// }

// type NewIf = ObjOmit<If, "c">

//Inspired from https://stackoverflow.com/questions/53899692/typescript-how-to-extract-only-the-optional-keys-from-a-type
export type OptionalKeys<T extends object> = Exclude<{
    [K in keyof T]: T extends Record<K, T[K]>
    ? never
    : K
}[keyof T], undefined>

export type RequiredKeys<T extends object> = Exclude<{
    [K in keyof T]: T extends Record<K, T[K]> ? K : never
}[keyof T], undefined>

export type PickOptional<T extends object> = Pick<T, OptionalKeys<T>>
export type PickRequired<T extends object> = Pick<T, RequiredKeys<T>>

interface R {
    r1: string
    r2: Date
    o1?: string
    o2?: Date
}

type OptRKeys = OptionalKeys<R>
type ReqRKeys = RequiredKeys<R>
type OptObj = PickOptional<R>
type ReqObj = PickRequired<R>