import o from "@tutao/otest";
import { delay, mapInCallContext, PromisableWrapper as PromiseableWrapper, promiseFilter, promiseMap } from "../lib/PromiseUtils.js";
import { defer } from "../lib/Utils.js";
import { func, matchers, when } from "testdouble";
import { verify } from "@tutao/tutanota-test-utils";
function mockDeferMapper() {
    const mapper = func((n) => n.promise);
    when(mapper(matchers.anything(), matchers.anything())).thenDo((n) => n.promise);
    return mapper;
}
o.spec("PromiseUtils", function () {
    o.spec("mapInCallContexnt", function () {
        o("works for values", function () {
            o(mapInCallContext([1, 2, 3, 4], (v) => v + 1).value).deepEquals([2, 3, 4, 5]);
        });
        o("works for promises", async function () {
            o(await mapInCallContext([1, 2, 3, 4], (v) => Promise.resolve(v + 1)).value).deepEquals([2, 3, 4, 5]);
        });
        o("works for mix of promises & values", async function () {
            o(await mapInCallContext([1, 2, 3, 4], (v) => (v % 2 === 0 ? Promise.resolve(v + 1) : v + 1)).value).deepEquals([2, 3, 4, 5]);
        });
    });
    o.spec("PromiseableWrapper", function () {
        o.spec("thenOrApply", function () {
            o("value + value = value", function () {
                o(new PromiseableWrapper("tuta").thenOrApply((v) => v + "nota").value).equals("tutanota");
            });
            o("value + promise = promise", async function () {
                const value = new PromiseableWrapper("tuta").thenOrApply((v) => Promise.resolve(v + "nota")).value;
                o(typeof value.then).equals("function");
                o(await value).equals("tutanota");
            });
            o("promise + value = promise", async function () {
                const value = new PromiseableWrapper(Promise.resolve("tuta")).thenOrApply((v) => v + "nota").value;
                o(typeof value.then).equals("function");
                o(await value).equals("tutanota");
            });
            o("proimse + promise = promise", async function () {
                const value = new PromiseableWrapper(Promise.resolve("tuta")).thenOrApply((v) => Promise.resolve(v + "nota")).value;
                o(typeof value.then).equals("function");
                o(await value).equals("tutanota");
            });
            o("promise + wrapper = promise", async function () {
                const value = new PromiseableWrapper(Promise.resolve("tuta")).thenOrApply((v) => new PromiseableWrapper(Promise.resolve(v + "nota"))).value;
                o(typeof value.then).equals("function");
                o(await value).equals("tutanota");
            });
            o("promise + promised wrapper = promise", async function () {
                const value = new PromiseableWrapper(Promise.resolve("tuta")).thenOrApply((v) => Promise.resolve(new PromiseableWrapper(v + "nota"))).value;
                o(typeof value.then).equals("function");
                o(await value).equals("tutanota");
            });
        });
        o.spec("toPromise", function () {
            o("from value", async function () {
                const promise = new PromiseableWrapper("tuta").toPromise();
                o(typeof promise.then).equals("function");
                o(await promise.then()).equals("tuta");
            });
            o("from promise", async function () {
                const promise = new PromiseableWrapper(Promise.resolve("tuta")).toPromise();
                o(typeof promise.then).equals("function");
                o(await promise.then()).equals("tuta");
            });
        });
    });
    o.spec("promiseMap Array<T>", function () {
        o("empty", async function () {
            o(await promiseMap([], (n) => n + 1)).deepEquals([]);
        });
        o("non-empty", async function () {
            o(await promiseMap([1, 2, 3], (n) => n + 1)).deepEquals([2, 3, 4]);
        });
        o("parallel", async function () {
            const defer1 = defer();
            const defer2 = defer();
            const defer3 = defer();
            const mapper = mockDeferMapper();
            promiseMap([defer1, defer2, defer3], mapper, {
                concurrency: 2,
            });
            await delay(1);
            verify(mapper(matchers.anything(), matchers.anything()), { times: 2 });
            defer1.resolve();
            await delay(1);
            verify(mapper(matchers.anything(), matchers.anything()), { times: 3 });
            defer2.resolve();
            await delay(1);
            verify(mapper(matchers.anything(), matchers.anything()), { times: 3 });
            defer3.resolve();
            await delay(1);
            verify(mapper(matchers.anything(), matchers.anything()), { times: 3 });
        });
        o("async in order", async function () {
            const defer1 = defer();
            const defer2 = defer();
            const mapper = mockDeferMapper();
            const resultPromise = promiseMap([defer1, defer2], mapper);
            await Promise.resolve();
            verify(mapper(matchers.anything(), matchers.anything()), { times: 1 });
            defer1.resolve(1);
            await delay(1);
            verify(mapper(matchers.anything(), matchers.anything()), { times: 2 });
            defer2.resolve(2);
            await Promise.resolve();
            o(await resultPromise).deepEquals([1, 2]);
        });
        o("stops on rejection", async function () {
            const defer1 = defer();
            const defer2 = defer();
            const mapper = mockDeferMapper();
            const resultPromise = promiseMap([defer1, defer2], mapper);
            await Promise.resolve();
            verify(mapper(matchers.anything(), matchers.anything()), { times: 1 });
            defer1.reject(new Error("test"));
            await o(() => resultPromise).asyncThrows(Error);
            verify(mapper(matchers.anything(), matchers.anything()), { times: 1 });
        });
        o("stops on exception", async function () {
            const mapper = func();
            when(mapper(matchers.anything(), matchers.anything()), { ignoreExtraArgs: true }).thenDo(() => {
                throw new Error("test");
            });
            await o(() => promiseMap([1, 2], mapper)).asyncThrows(Error);
            // we would test that the mapper is called here but testdouble is not supporting that and are being very stubborn about it
            //https://github.com/testdouble/testdouble.js/issues/412
        });
    });
    o.spec("promiseFilter", function () {
        function isEven(n) {
            return n % 2 === 0;
        }
        o("sync", async function () {
            const arr = [1, 2, 3, 4];
            const result = await promiseFilter(arr, isEven);
            o(result).deepEquals([2, 4]);
        });
        o("async", async function () {
            const arr = [1, 2, 3, 4];
            const result = await promiseFilter(arr, (n) => Promise.resolve(isEven(n)));
            o(result).deepEquals([2, 4]);
        });
        o("index", async function () {
            const arr = [1, 2, 3, 4];
            const result = await promiseFilter(arr, (_, i) => Promise.resolve(isEven(i)));
            o(result).deepEquals([1, 3]);
        });
        o("no concurrency", async function () {
            // One deferred per each item we want to check
            const arr = [1, 2, 3, 4];
            const deferred = [defer(), defer(), defer(), defer()];
            const mapper = func();
            when(mapper(matchers.anything(), matchers.anything())).thenDo((_, i) => {
                // testdouble being stubborn about calling this in verification too
                if (typeof i === "number") {
                    return deferred[i].promise;
                }
            });
            const resultP = promiseFilter(arr, mapper);
            verify(mapper(matchers.anything(), 0), { times: 1 });
            deferred[0].resolve(true);
            await delay(1);
            verify(mapper(matchers.anything(), matchers.anything()), { times: 2 });
            deferred[1].resolve(false);
            await delay(1);
            verify(mapper(matchers.anything(), matchers.anything()), { times: 3 });
            deferred[2].resolve(false);
            await delay(1);
            verify(mapper(matchers.anything(), matchers.anything()), { times: 4 });
            deferred[3].resolve(true);
            await delay(1);
            verify(mapper(matchers.anything(), matchers.anything()), { times: 4 });
            o(await resultP).deepEquals([1, 4]);
        });
    });
});
