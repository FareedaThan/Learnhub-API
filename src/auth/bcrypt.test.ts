import { hashPassword, compareHash } from "./bcrypt";

describe ("Compare hash", () => {
    test("Should be true", () => {
        ["1234", "fern", "dfoo", ".adkladkflsdkgldvkgslgs"].forEach(passwd => {
            expect(compareHash(passwd, hashPassword(passwd))).toEqual(true)
        })
    })

    test("Shold be false", () => {
        ["1234", "fern", "dfoo", ".adkladkflsdkgldvkgslgs"].forEach(passwd => {
            expect(compareHash(passwd, hashPassword(passwd+"d"))).toEqual(false)
        })
    })
})