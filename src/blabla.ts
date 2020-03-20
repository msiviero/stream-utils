export type Function<I, O> = (item: I) => O;
export type Operation<T> = Function<T, void>;
export type PropertySelector<T, P> = (item: T) => P;
export type Reducer<T, A> = (item: T, accumulator: A) => A;

/*
export class FinishStream<T> extends Writable {

    constructor(private readonly fn: Operation<T>) {
        super({ objectMode: true });
    }

    public _write(chunk: T, _: string, callback: (error?: Error | null) => void) {
        this.fn(chunk);
        callback();
    }

    public _final(callback: (error?: Error | null) => void) {
        this.emit("close");
        callback();
    }
}

export class MetricStream extends Transform {

    #totalProcessed = 0;
    #sampleItems = 0;
    #sampleStartTime = process.hrtime();

    constructor(private readonly sampleRate: number = 100) {
        super({ objectMode: true });
    }

    public _transform(object: any, _: string, callback: TransformCallback) {
        callback(undefined, object);

        this.#totalProcessed++;
        this.#sampleItems++;

        if (this.#sampleItems % this.sampleRate === 1) {
            this.#sampleStartTime = process.hrtime();
        }

        if (this.#sampleItems % this.sampleRate === 0) {
            const end = process.hrtime(this.#sampleStartTime);
            const sampleDuration = (end[0] + end[1]) / 1000 / 1000 / 1000;
            this.emit("metrics", (this.#sampleItems / sampleDuration).toFixed(3), this.#totalProcessed);
            this.#sampleItems = 0;
        }
    }
}
*/