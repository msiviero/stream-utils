import { Transform, TransformCallback, TransformOptions } from "stream";

/*
TODO write tsdoc
*/
export type MapFunction<T1, T2> = (item: T1) => T2;

export class Map<T1, T2> extends Transform {

    public constructor(private readonly mapFunction: MapFunction<T1, T2>, opts: TransformOptions = {}) {
        super({ objectMode: true, ...opts });
    }

    public _transform(object: T1, _: string, callback: TransformCallback) {
        this.push(this.mapFunction(object))
        callback();
    }
}

export type Predicate<T> = (item: T) => boolean;

export class Filter<T> extends Transform {

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

export type SerializationFunction<T> = MapFunction<T, string>;

export class Distinct<T> extends Transform {

    private readonly seen: { [idx: string]: boolean } = {};

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

export type Reducer<T, A> = (item: T, accumulator: A) => A;

export class Reduce<T, A> extends Transform {

    constructor(private readonly fn: Reducer<T, A>, private accumulator: A, opts: TransformOptions = {}) {
        super({ objectMode: true, ...opts });
    }

    public _transform(object: T, _: string, callback: TransformCallback) {
        this.accumulator = this.fn(object, this.accumulator);
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
export class Count extends Reduce<unknown, number> {
    constructor() {
        super((_, acc) => ++acc, 0);
    }
}

export class Limit<T> extends Transform {

    private count = 0;

    constructor(private readonly limit: number, opts: TransformOptions = {}) {
        super({ objectMode: true, ...opts });
    }

    public _transform(object: T, _: string, callback: TransformCallback) {
        this.push(object);
        callback();
        this.count++;
        if (this.count >= this.limit) {
            this.end();
        }
    }
}

export class FlatMap<T1, T2> extends Transform {

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