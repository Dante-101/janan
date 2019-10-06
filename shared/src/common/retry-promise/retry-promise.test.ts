import { expect } from 'chai'
import { stub } from 'sinon'

import { retryPromise, RetryPromiseOptions } from './retry-promise'

describe("retry promise", function () {
    this.timeout(100000)

    let resolveStr = "All good"
    let rejectContinueStr = "continue"
    let rejectDiscontinueStr = "Do not continue"
    let errorFunc = (err?: Error) => !!err && err.message == rejectContinueStr
    let options: Partial<RetryPromiseOptions> = {
        maxRetry: 3,
        minWaitTime: 10,
        maxWaitTime: 50
    }

    it('resolve with 0 retry', async function () {
        let func = stub()
        func.withArgs(0).resolves(resolveStr)
        const val = await retryPromise<string>(func, errorFunc, options)
        expect(val).to.eq(resolveStr)
    })

    it('resolve at 1 retry', async function () {
        let func = stub()
        func.withArgs(0).rejects(new Error(rejectContinueStr))
        func.withArgs(1).resolves(resolveStr)
        const val = await retryPromise(func, errorFunc, options)
        return expect(val).to.eq(resolveStr)
    })

    it('resolve at 2 retry', async function () {
        let func = stub()
        func.withArgs(0).rejects(new Error(rejectContinueStr))
        func.withArgs(1).rejects(new Error(rejectContinueStr))
        func.withArgs(2).resolves(resolveStr)
        const val = await retryPromise(func, errorFunc, options)
        expect(val).to.eq(resolveStr)
    })

    it('resolve at 3 retry', async function () {
        let func = stub()
        func.withArgs(0).rejects(new Error(rejectContinueStr))
        func.withArgs(1).rejects(new Error(rejectContinueStr))
        func.withArgs(2).rejects(new Error(rejectContinueStr))
        func.withArgs(3).resolves(resolveStr)
        const val = await retryPromise(func, errorFunc, options)
        expect(val).to.eq(resolveStr)
    })

    it('reject at 4 retry', async function () {
        let func = stub()
        func.withArgs(0).rejects(new Error(rejectContinueStr))
        func.withArgs(1).rejects(new Error(rejectContinueStr))
        func.withArgs(2).rejects(new Error(rejectContinueStr))
        func.withArgs(3).rejects(new Error(rejectContinueStr))
        func.withArgs(4).resolves(resolveStr)
        try {
            await retryPromise(func, errorFunc, options)
            expect.fail()
        } catch (e) {
            expect(e.message).to.eq(rejectContinueStr)
        }
    })

    it('discontinue after reject at 1 retry', async function () {
        let func = stub()
        func.withArgs(0).rejects(new Error(rejectContinueStr))
        func.withArgs(1).rejects(new Error(rejectDiscontinueStr))
        func.withArgs(2).resolves(resolveStr)
        try {
            await retryPromise(func, errorFunc, options)
            expect.fail()
        } catch (e) {
            expect(e.message).to.eq(rejectDiscontinueStr)
        }
    })
})