# promise-queue

> A simple promise queue that runs promises in order

## Usage

```ts
import { PromiseQueue } from "https://deno.land/x/promise_queue/main.ts";

const queue = new PromiseQueue({ maxSimultaneous: 3 });

queue.add(fetch("https://example.com/1"));
```

## Development

```sh
deno test
```
