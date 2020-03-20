import { Readable } from "stream";
import { LineSplitterStream } from "../src/input";
import { TestOutStream } from "./util";

describe("LineSplitterStream", () => {

    it("should be able to parse buffer in lines according to separator", (done) => {

        Readable
            .from([
                Buffer.from("aa***bbb***ccc"),
                Buffer.from("ccc***ddd***eeee***fffffff"),
            ])
            .pipe(new LineSplitterStream({ highWaterMark: 3, separator: "***" }))
            .pipe(new TestOutStream())
            .on("close", (chunks: string[]) => {
                expect(chunks).toEqual(["aa", "bbb", "cccccc", "ddd", "eeee", "fffffff"]);
                done();
            });
    });

    it("should be able to escape BOM bytes", (done) => {

        Readable
            .from([
                Buffer.from([239, 187, 191]),
                Buffer.from("aa***bbb***ccc"),
                Buffer.from("ccc***ddd***eeee***fffffff"),
            ])
            .pipe(new LineSplitterStream({ highWaterMark: 3, separator: "***" }))
            .pipe(new TestOutStream())
            .on("close", (chunks: string[]) => {
                expect(chunks).toEqual(["aa", "bbb", "cccccc", "ddd", "eeee", "fffffff"]);
                done();
            });
    });

});

