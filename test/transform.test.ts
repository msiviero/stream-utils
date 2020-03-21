import { Readable } from "stream";
import { Distinct, Filter, Map, Reduce, Count, Limit, FlatMap } from "../src/transform";
import { Collect } from "../src/sink";

describe("Map", () => {

    it("should map streams", (done) => {

        Readable
            .from(["a", "bb", "ccc"])
            .pipe(new Map((item: string) => item.length))
            .pipe(new Collect()).on("close", (chunks: number[]) => {
                expect(chunks).toEqual([1, 2, 3]);
                done();
            });
    });
});

describe("Filter", () => {

    it("should filter streams", (done) => {

        Readable
            .from([1, 0, 11, 13, 12, 15, 7, 5, 6, 8])
            .pipe(new Filter((item: number) => item % 2 === 0))
            .pipe(new Collect())
            .on("close", (chunks: number[]) => {
                expect(chunks).toEqual([0, 12, 6, 8]);
                done();
            });
    });
});

describe("Distinct", () => {

    it("should remove elements already present in prevoius stream", (done) => {

        Readable
            .from([1, 0, 11, 0, 0, 15, 1, 11, 5, 11])
            .pipe(new Distinct((item: number) => item.toString(10)))
            .pipe(new Collect())
            .on("close", (chunks: number[]) => {
                expect(chunks).toEqual([1, 0, 11, 15, 5]);
                done();
            });
    });
});


describe("Reduce", () => {

    it("should perform reduce operation as configured", (done) => {
        Readable
            .from([1, 2, 3, 4])
            .pipe(new Reduce((item: number, accumulator: number) => accumulator + item, 0))
            .pipe(new Collect())
            .on("close", (chunks: string[]) => {
                expect(chunks).toEqual([10]);
                done();
            });
    });
});

describe("Count", () => {

    it("should perform reduce operation as configured", (done) => {
        Readable
            .from([1, 2, 3, 4])
            .pipe(new Count())
            .pipe(new Collect())
            .on("close", (chunks: string[]) => {
                expect(chunks).toEqual([4]);
                done();
            });
    });
});

describe("Limit", () => {

    it("should cut the stream", (done) => {
        Readable
            .from([1, 2, 3, 4])
            .pipe(new Limit(2))
            .pipe(new Collect())
            .on("close", (chunks: string[]) => {
                expect(chunks).toEqual([1, 2]);
                done();
            });
    });
});

describe("Flat", () => {

    it("should map streams", (done) => {

        Readable
            .from([["a", "aa", "bbb"], ["dddd", "eeeee"], ["ffffff", "hhhhhhh"]])
            .pipe(new FlatMap((item: string) => item.length))
            .pipe(new Collect())
            .on("close", (chunks: string[]) => {
                expect(chunks).toEqual([1, 2, 3, 4, 5, 6, 7]);
                done();
            });
    });
});
