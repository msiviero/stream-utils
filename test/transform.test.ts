import { Readable } from "stream";
import { DistinctStream, FilterStream, MapStream, ReduceStream } from "../src/transform";
import { TestOutStream } from "./util";

describe("MapStream", () => {

    it("should map streams", (done) => {

        Readable
            .from(["a", "bb", "ccc"])
            .pipe(new MapStream((item: string) => item.length))
            .pipe(new TestOutStream()).on("close", (chunks: string[]) => {
                expect(chunks).toEqual([1, 2, 3]);
                done();
            });
    });
});

describe("FilterStream", () => {

    it("should filter streams", (done) => {

        Readable
            .from([1, 0, 11, 13, 12, 15, 7, 5, 6, 8])
            .pipe(new FilterStream((item: number) => item % 2 === 0))
            .pipe(new TestOutStream())
            .on("close", (chunks: string[]) => {
                expect(chunks).toEqual([0, 12, 6, 8]);
                done();
            });
    });
});

describe("DistinctStream", () => {

    it("should remove elements already present in prevoius stream", (done) => {

        Readable
            .from([1, 0, 11, 0, 0, 15, 1, 11, 5, 11])
            .pipe(new DistinctStream((item: number) => item.toString(10)))
            .pipe(new TestOutStream())
            .on("close", (chunks: string[]) => {
                expect(chunks).toEqual([1, 0, 11, 15, 5]);
                done();
            });
    });
});

describe("ReduceStream", () => {

    it("should perform reduce operation as configured", (done) => {

        Readable
            .from([1, 2, 3, 4])
            .pipe(new ReduceStream((item: number, accumulator: number) => accumulator + item, 0))
            .pipe(new TestOutStream())
            .on("close", (chunks: string[]) => {
                expect(chunks).toEqual([10]);
                done();
            });
    });
});