import { Readable } from "stream";
import { Collect } from "../src/sink";
import { Splitter } from "../src/source";

describe("Splitter", () => {

    it("should be able to parse buffer in lines according to separator", (done) => {

        Readable
            .from([
                Buffer.from("aa***bbb***ccc"),
                Buffer.from("ccc***ddd***eeee***fffffff"),
            ])
            .pipe(new Splitter({ highWaterMark: 3, separator: "***" }))
            .pipe(new Collect())
            .on("close", (chunks: string[]) => {
                expect(chunks)
                    .toEqual([
                        Buffer.from("aa"),
                        Buffer.from("bbb"),
                        Buffer.from("cccccc"),
                        Buffer.from("ddd"),
                        Buffer.from("eeee"),
                        Buffer.from("fffffff"),
                    ]);
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
            .pipe(new Splitter({ highWaterMark: 3, separator: "***" }))
            .pipe(new Collect())
            .on("close", (chunks: Buffer[]) => {
                expect(chunks)
                    .toEqual([
                        Buffer.from("aa"),
                        Buffer.from("bbb"),
                        Buffer.from("cccccc"),
                        Buffer.from("ddd"),
                        Buffer.from("eeee"),
                        Buffer.from("fffffff"),
                    ]);
                done();
            });
    });

});

