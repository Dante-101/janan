import { expect } from 'chai'
import { isJwtToken } from 'shared/src/common/auth'
import { JwtRequestPayload } from 'shared/src/framework/models/auth'

import { Jwt } from '../../src/jwt'

describe("JWT test", function () {
    const payload: JwtRequestPayload = {
        pid: "12345",
        roles: ["customer"]
    }
    const jwt = new Jwt("A39ECBB5BE5BC33085839B2090AAED3CAC5D4D6768743F660B3B43AA33CBE8419B6B8D92F7583979B80DC2640B53379A930B2DAEAEA99B7F3F3C3DB3629C66CC")

    it('async sign and verify', async () => {
        const token = await jwt.sign(payload)
        expect(isJwtToken(token)).to.be.true
        const verifiedPayload = await jwt.verify(token)
        expect(verifiedPayload.pid).to.eq(payload.pid)
        expect(verifiedPayload.roles).to.deep.eq(payload.roles)
    })

    it('sync sign and verify', function () {
        const token = jwt.signSync(payload)
        expect(isJwtToken(token)).to.be.true
        const verifiedPayload = jwt.verifySync(token)
        expect(verifiedPayload.pid).to.eq(payload.pid)
        expect(verifiedPayload.roles).to.deep.eq(payload.roles)
    })
})