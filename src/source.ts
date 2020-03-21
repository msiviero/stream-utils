import { Transform, TransformCallback, TransformOptions } from "stream";

export interface SplitterOpts extends TransformOptions {
    separator?: string;
    encoding?: string;
}

/**
 * A transform stream that splits a bytes IO stream into chunks by a separator
 *
 * ```typescript
 * createReadStream("./data/bigfile.txt")
 *  .pipe(new Splitter({ separator: "\n" }))
 *  .pipe(new Collect())
 *  .on("close", (chunks: Buffer[]) => {
 *      console.log(chunks); //
 *  });
 * ```
 */
export class Splitter extends Transform {

    private readonly separator: Buffer;

    private buffer: Buffer;

    constructor(opts: SplitterOpts) {
        super({ objectMode: true, ...opts });
        this.separator = Buffer.from(opts.separator || "\n");
        this.buffer = Buffer.alloc(0);
    }

    public _transform(chunk: Buffer, _: string, callback: TransformCallback) {

        if (Buffer.from([239, 187, 191]).compare(chunk, 0, 3) === 0) {
            chunk = chunk.slice(3)
        }

        let position = 0;

        while (position < chunk.length) {
            const slice = chunk.slice(position, position + this.separator.length);
            if (slice.compare(this.separator) === 0) {
                this.push(this.buffer);
                this.buffer = Buffer.alloc(0);
                position += this.separator.length;
            } else {
                this.buffer = Buffer.concat([this.buffer, Buffer.of(chunk[position])]);
                position++;
            }
        }
        callback();
    }

    public _flush(callback: TransformCallback) {
        this.push(this.buffer);
        callback();
    }
}
