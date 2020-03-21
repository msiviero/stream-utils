# Node.js array-like stream abstraction

## Installation
```
npm i @msiviero/stream-utils
```

## Simple usage

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

Typedocs with full documentation at https://msiviero.github.io/stream-utils
