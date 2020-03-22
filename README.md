# Node.js array-like stream abstraction

## Installation
```
npm i @msiviero/stream-utils
```

Typedocs with full documentation at https://msiviero.github.io/stream-utils

## Samples

### Simple text file read and processing

The file is processed in chunks, so the memory usage is linear. Plus the backpressure mechanism is built-in

```typescript

import { createReadStream } from "fs";
import { Collect, Count, Distinct, Filter, Map, Splitter } from "@msiviero/stream-utils";


createReadStream("./data/bigfile.txt")
    .pipe(new Splitter({ separator: "\n" }))
    .pipe(new Map((line: Buffer) => line.toString("utf8")))
    .pipe(new Distinct((line: string) => line))
    .pipe(new Map((line: string) => line.split(";")))
    .pipe(new Filter((columns: string[]) => columns[0] === "to_keep"))
    .pipe(new Count())
    .pipe(new Collect())
    .on("close", (items: number[]) => {
        console.log(`Count of remaining records is: ${items[0]}`);
    });
```

### An http request is a stream too

A node.js server's request is a readable stream, so you can receive a large request body 
and processing can be done just in time chunk per chunk, without having to fit it in memory

```typescript
import { Collect, Count, Distinct, Map, Splitter } from "@msiviero/stream-utils";
import { createServer } from "http";


createServer((request, response) => {
  request
    .pipe(new Splitter({ separator: "\n" }))
    .pipe(new Map((line: Buffer) => line.toString("utf8")))
    .pipe(new Distinct((line: string) => line))
    .pipe(new Count())
    .pipe(new Collect())
    .on("close", (items: number[]) => {
      response.end(`Request body contains ${items[0]} lines`);
    });
})
  .listen(9000);
```

### Node provides built-in streams

That can be used as a source or sink for transformations provided by this package

- HTTP requests and responses, from client and server
- fs write and read streams
- zlib streams
- crypto streams
- TCP sockets
- child process stdin, stdout and stderr
- process.stdin process.stdout, process.stderr


#### an example of http server that receives a text body, parse it, deduplicates lines and then creates a gzip file with the content

```typescript
import { Distinct, Map, Splitter } from "@msiviero/stream-utils";
import { createWriteStream } from "fs";
import { createServer } from "http";
import { createGzip } from "zlib";


createServer((request, response) => {
  request
    .pipe(new Splitter({ separator: "\n" }))
    .pipe(new Map((line: Buffer) => line.toString("utf8")))
    .pipe(new Distinct((line: string) => line))
    .pipe(new Map((line: string) => `${line}\n`))
    .pipe(createGzip())
    .pipe(createWriteStream("request.gz"))
    .on("close", () => response.end());
})
  .listen(9000);
```


#### an example of http server that receives a gzipped file as body, parse it, deduplicates and count the lines and then finally pipes to the response stream

``` typescript
import { Count, Distinct, Map, Splitter } from "@msiviero/stream-utils";
import { createServer } from "http";
import { createGunzip } from "zlib";


createServer((request, response) => {
  request
    .pipe(createGunzip())
    .pipe(new Splitter({ separator: "\n" }))
    .pipe(new Map((line: Buffer) => line.toString("utf8")))
    .pipe(new Distinct((line: string) => line))
    .pipe(new Count())
    .pipe(new Map((items: [number]) => Buffer.from(`${items}`))) // serialize item
    .pipe(response);
})
  .listen(9000);

```
