import { Writable } from "stream";

/**
 * A writable stream that acts a collector for previous operations results
 * and provides an "close" event to act on them after finshed
 *
 * ```typescript
 * Readable
 *  .from([1, 2, 3, 4])
 *  .pipe(new Collect())
 *  .on("close", (chunks: string[]) => {
 *      console.log(chunks); // [1,2,3,4]
 *  });
 * ```
 *
 * @typeParam T the type of record passed down by previous streams
 */
export class Collect<T> extends Writable {

    readonly #chunks: T[] = [];

    constructor() {
        super({ objectMode: true });
    }

    public _write(chunk: T, _: string, done: (error?: Error | null) => void) {
        this.#chunks.push(chunk);
        done();
    }

    public _final(done: (error?: Error | null) => void) {
        this.emit("close", this.written());
        done();
    }

    public written = () => [...this.#chunks];
}
