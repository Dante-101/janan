import { expect } from 'chai'
import { pathExists } from 'fs-extra'

export const validateIfFilesExists = async (paths: string[]) => {
    const existArr = await Promise.all(paths.map(path => pathExists(path)))
    paths.forEach((path, i) => { expect(existArr[i]).to.equal(true, `Expected path ${path} is not present`) })
}
