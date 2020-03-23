import { Transform, TransformCallback, TransformOptions } from "stream";

export type MapFunction<T1, T2> = (item: T1) => T2;

/**
 * A transform stream that maps previous stream elements to another type
 *
 * ```typescript
 * Readable
 *  .from([1, 2, 3, 4])
 *  .pipe(new Map((n: number) => n + 1))
 *  .on("close", (chunks: number[]) => {
 *      console.log(chunks); // [2, 3, 4, 5]
 *  });
 * ```
 *
 * @typeParam T1 the type of record passed down by previous streams
 * @typeParam T2 the type returned by the mapping function passed to the following streams
 */
export class Map<T1, T2> extends Transform {

    /**
     * @param mapFunction The function used to map stream items
     * @param opts The stream's options
     */
    public constructor(private readonly mapFunction: MapFunction<T1, T2>, opts: TransformOptions = {}) {
        super({ objectMode: true, ...opts });
    }

    public _transform(object: T1, _: string, callback: TransformCallback) {
        this.push(this.mapFunction(object))
        callback();
    }
}

/**
 * A function used to filter items
 *
 * @typeParam T the type of record passed to the function
 *
 * @param item the source item to decide wheter to keep
 * @returns true if the item should be kept
 */
export type Predicate<T> = (item: T) => boolean;

/**
 * A transform stream that filters previous stream elements according to a predicate
 *
 * ```typescript
 * Readable
 *  .from([1, 0, 11, 13, 12, 15, 7, 5, 6, 8])
 *  .pipe(new Map((n: number) => n + 1))
 *  .on("close", (chunks: number[]) => {
 *      console.log(chunks); // [0, 12, 6, 8]
 *  });
 * ```
 *
 * @typeParam T the type of record passed down by previous streams
 */
export class Filter<T> extends Transform {

    /**
     * @param predicate The predicate function used to filter the stream
     * @param opts The stream's options
     */
    constructor(private readonly predicate: Predicate<T>, opts: TransformOptions = {}) {
        super({ objectMode: true, ...opts });
        this.predicate = predicate;
    }

    public _transform(object: T, _: string, callback: TransformCallback) {
        if (this.predicate(object)) {
            this.push(object);
        }
        callback();
    }
}

/**
 * A function that takes an element and returns a string representing it
 *
 * @typeParam T the type of record passed to the function
 *
 * @param item the source item to serialize
 * @returns The string representation of the object
 */
export type SerializationFunction<T> = MapFunction<T, string>;

/**
 * A transform stream that filters equal elements. Equality is determined by
 * a provided serializing function
 *
 * ```typescript
 * Readable
 *  .from([1, 0, 11, 0, 0, 15, 1, 11, 5, 11])
 *  .pipe(new Distinct((item: number) => item.toString(10)))
 *  .on("close", (chunks: number[]) => {
 *      console.log(chunks); // [1, 0, 11, 15, 5]
 *  });
 * ```
 *
 * @typeParam T the type of record passed down by previous streams
 */
export class Distinct<T> extends Transform {

    private readonly seen: { [idx: string]: boolean } = {};

    /**
     * @param serializationFunction The serialization function used to test items equality
     * @param opts The stream's options
     */
    constructor(
        private readonly serializationFunction: SerializationFunction<T>,
        opts: TransformOptions = {},
    ) {
        super({ objectMode: true, ...opts });
    }

    public _transform(object: T, _: string, callback: TransformCallback) {
        const property = this.serializationFunction(object);
        if (!this.seen[property]) {
            this.push(object);
            this.seen[property] = true;
        }
        callback();
    }
}

/**
 * A function that takes an element and an aggergator item and return a new aggregators state
 *
 * @typeParam T the type of record passed to the function
 * @typeParam A the type of the aggregator object
 *
 * @param item the source item to aggregate
 * @param accumulator the prevoius step state
 * @returns The new aggregator state
 */
export type Reducer<T, A> = (item: T, accumulator: A) => A;

/**
 * A transform stream that reduces items using the provided function
 *
 * ```typescript
 * Readable
 *  .from([1, 2, 3, 4])
 *  .pipe(new Reduce((item: number, accumulator: number) => accumulator + item, 0))
 *  .on("close", (chunks: number[]) => {
 *      console.log(chunks); // [10]
 *  });
 * ```
 *
 * @typeParam T the type of record passed down by previous streams
 * @typeParam A the type of aggregation result
 */
export class Reduce<T, A> extends Transform {

    /**
     * @param reducer The reducer function used to aggregate items
     * @param opts The stream's options
     */
    constructor(
        private readonly reducer: Reducer<T, A>,
        private accumulator: A, opts: TransformOptions = {},
    ) {
        super({ objectMode: true, ...opts });
    }

    public _transform(object: T, _: string, callback: TransformCallback) {
        this.accumulator = this.reducer(object, this.accumulator);
        callback();
    }

    public _flush(callback: TransformCallback) {
        this.push(this.accumulator);
        callback();
    }

    public _final(callback: (error?: Error | null) => void) {
        callback();
    }
}

/**
 * A specialized reduce stream aggregates items counting
 *
 * ```typescript
 * Readable
 *  .from([1, 2, 3, 4])
 *  .pipe(new Count())
 *  .on("close", (chunks: number[]) => {
 *      console.log(chunks); // [4]
 *  });
 * ```
 */
export class Count extends Reduce<unknown, number> {

    constructor() {
        super((_, acc) => ++acc, 0);
    }
}

/**
 * A transform stream that reduces the number of elements processed
 *
 * ```typescript
 * Readable
 *  .from([1, 2, 3, 4])
 *  .pipe(new Limit(2))
 *  .on("close", (chunks: number[]) => {
 *      console.log(chunks); // [1, 2]
 *  });
 * ```
 * @typeParam T the type of record passed down by previous streams
 */
export class Limit<T> extends Transform {

    private count = 0;

    /**
     * @param limit The number of items after which the stream should end
     * @param opts The stream's options
     */
    constructor(private readonly limit: number, opts: TransformOptions = {}) {
        super({ objectMode: true, ...opts });
    }

    public _transform(object: T, _: string, callback: TransformCallback) {
        if (this.count < this.limit) {
            this.push(object);
        }
        this.count++;
        callback();
    }
}

/**
 * A transform stream that flattens stream of iterables using the provided function
 *
 * ```typescript
 * Readable
 *  .from([["a", "aa", "bbb"], ["dddd", "eeeee"], ["ffffff", "hhhhhhh"]])
 *  .pipe(new FlatMap((item: string) => item.length))
 *  .on("close", (chunks: number[]) => {
 *      console.log(chunks); // [1, 2, 3, 4, 5, 6, 7]
 *  });
 * ```
 * @typeParam T the type of record passed down by previous streams
 */
export class FlatMap<T1, T2> extends Transform {

    /**
     * @param mapFunction The map function used map items
     * @param opts The stream's options
     */
    public constructor(
        private readonly mapFunction: MapFunction<T1, T2>,
        opts: TransformOptions = {},
    ) {
        super({ objectMode: true, ...opts });
    }

    public _transform(objects: Iterable<T1>, _: string, callback: TransformCallback) {
        for (const o of objects) {
            this.push(this.mapFunction(o));
        }
        callback();
    }
}