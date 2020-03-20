# Node.js array-like stream abstraction

## Installation
```
npm i @msiviero/stream-utils
```

## Simple usage

```typescript

import { createReadStream } from "fs";
import { Splitter, Map } from "./index";
import { Filter, Count, Distinct } from "./transform";
import { Collect } from "./sink";


createReadStream("./data/bigfile.txt")
    .pipe(new Splitter({ separator: "\n" }))
    .pipe(new Map((line: Buffer) => line.toString("utf8")))
    .pipe(new Distinct((line: string) => line))
    .pipe(new Map((line: string) => line.split(";")))
    .pipe(new Filter((columns: string[]) => columns[0] === "to_keep"))
    .pipe(new Count())
    .pipe(new Collect())
    .on("end", (items) => {
        console.log(`Countr of remaining records is: ${items[0]}`);
    });
```
