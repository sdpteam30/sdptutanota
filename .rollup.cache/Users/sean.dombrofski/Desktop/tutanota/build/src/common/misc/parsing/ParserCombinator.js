// @bundleInto:common-min
import { downcast } from "@tutao/tutanota-utils";
import { TutanotaError } from "@tutao/tutanota-error";
export class ParserError extends TutanotaError {
    filename;
    constructor(message, filename) {
        super("ParserError", message);
        this.filename = filename ?? null;
    }
}
export const combineParsers = downcast((...parsers) => (iterator) => parsers.map((p) => p(iterator)));
export function makeCharacterParser(character) {
    return (iterator) => {
        let value = iterator.peek();
        if (value === character) {
            iterator.next();
            return value;
        }
        const sliceStart = Math.max(iterator.position - 10, 0);
        const sliceEnd = Math.min(iterator.position + 10, iterator.iteratee.length - 1);
        throw new ParserError(`expected character "${character}" got "${value}" near ${iterator.iteratee.slice(sliceStart, sliceEnd)}`);
    };
}
export function makeNotCharacterParser(character) {
    return (iterator) => {
        let value = iterator.peek();
        if (value && value !== character) {
            iterator.next();
            return value;
        }
        const sliceStart = Math.max(iterator.position - 10, 0);
        const sliceEnd = Math.min(iterator.position + 10, iterator.iteratee.length - 1);
        throw new ParserError(`expected character "${character}" got "${value}" near ${iterator.iteratee.slice(sliceStart, sliceEnd)}`);
    };
}
export function makeZeroOrMoreParser(anotherParser) {
    return (iterator) => {
        const result = [];
        try {
            let parseResult = anotherParser(iterator);
            while (true) {
                result.push(parseResult);
                parseResult = anotherParser(iterator);
            }
        }
        catch (e) {
            /* empty */
        }
        return result;
    };
}
export function mapParser(parser, mapper) {
    return (iterator) => {
        return mapper(parser(iterator));
    };
}
export function makeOneOrMoreParser(parser) {
    return mapParser(makeZeroOrMoreParser(parser), (value) => {
        if (value.length === 0) {
            throw new ParserError("Expected at least one value, got none");
        }
        return value;
    });
}
export function maybeParse(parser) {
    return (iterator) => {
        const iteratorPosition = iterator.position;
        try {
            return parser(iterator);
        }
        catch (e) {
            if (e instanceof ParserError) {
                iterator.position = iteratorPosition;
            }
            return null;
        }
    };
}
export function makeSeparatedByParser(separatorParser, valueParser) {
    return (iterator) => {
        const result = [];
        result.push(valueParser(iterator));
        while (true) {
            try {
                separatorParser(iterator);
            }
            catch (e) {
                break;
            }
            result.push(valueParser(iterator));
        }
        return result;
    };
}
export function makeEitherParser(parserA, parserB) {
    return (iterator) => {
        const iteratorPosition = iterator.position;
        try {
            return parserA(iterator);
        }
        catch (e) {
            if (e instanceof ParserError) {
                iterator.position = iteratorPosition;
                return parserB(iterator);
            }
            throw e;
        }
    };
}
export function makeOneOfCharactersParser(allowed) {
    return (iterator) => {
        const value = iterator.peek();
        if (value && allowed.includes(value)) {
            iterator.next();
            return value;
        }
        throw new ParserError(`Expected one of ${allowed.map((c) => `"${c}"`).join(", ")}, but got "${value}\n${context(iterator, iterator.position, 10)}"`);
    };
}
export function makeNotOneOfCharactersParser(notAllowed) {
    return (iterator) => {
        const value = iterator.peek();
        if (typeof value !== "string") {
            throw new ParserError("unexpected end of input");
        }
        if (!notAllowed.includes(value)) {
            iterator.next();
            return value;
        }
        throw new ParserError(`Expected none of ${notAllowed.map((c) => `"${c}"`).join(", ")}, but got "${value}"\n${context(iterator, iterator.position, 10)}`);
    };
}
export const numberParser = mapParser(makeOneOrMoreParser(makeOneOfCharactersParser(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"])), (values) => parseInt(values.join(""), 10));
export class StringIterator {
    iteratee;
    position = -1;
    constructor(iteratee) {
        this.iteratee = iteratee;
    }
    next() {
        const value = this.iteratee[++this.position];
        const done = this.position >= this.iteratee.length;
        return done
            ? {
                done: true,
                value: undefined,
            }
            : {
                done: false,
                value,
            };
    }
    peek() {
        return this.iteratee[this.position + 1] ?? null;
    }
}
function context(iterator, contextCentre, contextRadius = 10) {
    const sliceStart = Math.max(contextCentre - contextRadius, 0);
    const sliceEnd = Math.min(contextCentre + contextRadius, iterator.iteratee.length - 1);
    const sliceLength = sliceEnd - sliceStart;
    const actualPosition = contextCentre - (2 * contextRadius - sliceLength);
    return iterator.iteratee.slice(sliceStart, sliceEnd);
}
//# sourceMappingURL=ParserCombinator.js.map