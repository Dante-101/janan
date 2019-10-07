import { expect } from 'chai'
import { TimeMeasure } from 'shared/src/framework/time-measure'

describe("Utils", function () {
    it('time measure', async () => {
        const timeout = 300
        let timeMeasure = new TimeMeasure(true)
        let promise = new Promise<number>((resolve, reject) => {
            setTimeout(() => { resolve(timeMeasure.end()) }, timeout)
        })
        let val = await promise
        expect(val).to.be.closeTo(timeout, 0.1 * timeout)
    })
})
