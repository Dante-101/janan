import { expect } from 'chai'
import { toNonEmptyArr } from 'shared/src/common/transform'
import { ExtError, ExtErrorCode } from 'shared/src/framework/error'

export const validateFailure = async (promise: Promise<any>, codes: ExtErrorCode | ExtErrorCode[], msg: string = "") => {
    try {
        await promise
        expect.fail('', '', "Promise resolved instead of failing")
    } catch (e) {
        validateExtError(e, codes, msg)
    }
}

export const validateExtError = (e: Error, codes: ExtErrorCode | ExtErrorCode[], msg: string = "", httpStatus?: number) => {
    expect(e).instanceof(ExtError, "The promise failed with other error - mostly chai's expect.fail()")
    if (e instanceof ExtError) {
        codes = toNonEmptyArr(codes)
        expect(e.errorCodes).to.include.members(codes)
        if (msg) {
            expect(e.toString().toLocaleLowerCase()).to.include(msg.toLocaleLowerCase())
        }
        if (httpStatus) {
            expect(e.httpStatus).to.eq(httpStatus)
        }
    }
}
