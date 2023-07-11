"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const oembed_1 = require("./oembed");
describe("Check Video detail", () => {
    const allKeys = ["videoTitle", "videoUrl", "thumbnailUrl", "creatorName", "creatorUrl"];
    // const url1 = "https://www.youtube.com/watch?v=i5nUufn_FmE&ab_channel=SMTOWN"
    const url2 = "https://www.youtube.com/watch?v=ZRtdQ81jPUQ&ab_channel=Ayase%2FYOASOBI";
    // test("Values should be equal", async () => {
    //     expect(await getVideoDetails(url1)).toEqual({
    //         videoTitle: "EXO 엑소 'Cream Soda' MV",
    //         videoUrl: "https://www.youtube.com/watch?v=i5nUufn_FmE&ab_channel=SMTOWN",
    //         thumbnailUrl: "https://i.ytimg.com/vi/i5nUufn_FmE/hqdefault.jpg",
    //         creatorName: "SMTOWN",
    //         creatorUrl: "https://www.youtube.com/@SMTOWN",
    //     })
    // })
    test("Check key", async () => {
        expect(Object.keys(await (0, oembed_1.getVideoDetails)(url2))).toEqual(allKeys);
    });
});
//# sourceMappingURL=oembeb.test.js.map