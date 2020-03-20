import { Writable } from "stream";

export class TestOutStream<T> extends Writable {

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
