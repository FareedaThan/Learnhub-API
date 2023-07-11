"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = require("./bcrypt");
describe("Compare hash", () => {
    test("Should be true", () => {
        ["1234", "fern", "dfoo", ".adkladkflsdkgldvkgslgs"].forEach(passwd => {
            expect((0, bcrypt_1.compareHash)(passwd, (0, bcrypt_1.hashPassword)(passwd))).toEqual(true);
        });
    });
    test("Shold be false", () => {
        ["1234", "fern", "dfoo", ".adkladkflsdkgldvkgslgs"].forEach(passwd => {
            expect((0, bcrypt_1.compareHash)(passwd, (0, bcrypt_1.hashPassword)(passwd + "d"))).toEqual(false);
        });
    });
});
//# sourceMappingURL=bcrypt.test.js.map