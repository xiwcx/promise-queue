import { assert, assertEquals } from "@std/assert";
import { assertSpyCall, assertSpyCalls, spy } from "@std/testing/mock";
import { PromiseQueue } from "../main.ts";
import { createTimeoutPromise } from "./util.ts";
import { delay } from "jsr:@std/async";

Deno.test("queue calls all promises", async () => {
  const queue = new PromiseQueue({ maxSimultaneous: 3 });

  const p1 = createTimeoutPromise(1000);
  const p2 = createTimeoutPromise(1000);
  const p3 = createTimeoutPromise(1000);

  queue.add(p1);
  queue.add(p2);
  queue.add(p3);

  assertEquals(queue.active.length, 3);

  await Promise.all([p1, p2, p3]);

  assertEquals(queue.active.length, 0);
});

Deno.test("maxSimultaneous works", async () => {
  const queue = new PromiseQueue({ maxSimultaneous: 3 });

  const p1 = createTimeoutPromise(1000);
  const p2 = createTimeoutPromise(1000);
  const p3 = createTimeoutPromise(1000);
  const p4 = createTimeoutPromise(1000);
  const p5 = createTimeoutPromise(1000);

  queue.add(p1);
  queue.add(p2);
  queue.add(p3);
  queue.add(p4);
  queue.add(p5);

  assertEquals(queue.active.length, 3);

  await Promise.all([p1, p2, p3, p4, p5]);

  // active array is cleared slightly after the promises resolve
  // hack solution for now, lookin to Deno `waitFor` equivalent
  // https://github.com/testing-library/dom-testing-library/blob/a86c54ccda5242ad8dfc1c70d31980bdbf96af7f/src/wait-for.js#L18
  await delay(1000);

  assertEquals(queue.active.length, 0);
});

Deno.test("promises are resolved in order", async () => {
  const onResolveSpy = spy();
  const queue = new PromiseQueue({
    maxSimultaneous: 2,
    onResolve: onResolveSpy,
  });

  const p1 = createTimeoutPromise(1000, "first");
  const p2 = createTimeoutPromise(100, "second");
  const p3 = createTimeoutPromise(100, "third");

  queue.add(p1);
  queue.add(p2);
  queue.add(p3);

  await Promise.all([p1, p2, p3]);

  assertSpyCalls(onResolveSpy, 3);
  assertSpyCall(onResolveSpy, 0, { args: ["second"] });
  assertSpyCall(onResolveSpy, 1, { args: ["third"] });
  assertSpyCall(onResolveSpy, 2, { args: ["first"] });
});
