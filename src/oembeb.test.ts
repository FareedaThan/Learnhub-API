import { getVideoDetails } from "./oembed";

describe ("Check Video detail", () => {
    test("Check return key", async () => {
        const allKeys = ["videoTitle", "videoUrl", "thumbnailUrl", "creatorName", "creatorUrl"]
        const url = "https://www.youtube.com/watch?v=i5nUufn_FmE&ab_channel=SMTOWN"
        expect(Object.keys(await getVideoDetails(url))).toEqual(allKeys)
    })

    test("Values should be equal", async () => {
        const url = "https://www.youtube.com/watch?v=i5nUufn_FmE&ab_channel=SMTOWN"
        expect(await getVideoDetails(url)).toEqual({
            videoTitle: "EXO 엑소 'Cream Soda' MV",
            videoUrl: "https://www.youtube.com/watch?v=i5nUufn_FmE",
            thumbnailUrl: "https://i.ytimg.com/vi/i5nUufn_FmE/hqdefault.jpg",
            creatorName: "SMTOWN",
            creatorUrl: "https://www.youtube.com/@SMTOWN",
        })
    })

    test("Check return url", async() => {
        const url ="https://www.youtube.com/watch?v=ZRtdQ81jPUQ&ab_channel=Ayase%2FYOASOBI"
        
        const vidInfo = await getVideoDetails(url)
        expect(vidInfo.videoUrl).toEqual(url)
    })
})