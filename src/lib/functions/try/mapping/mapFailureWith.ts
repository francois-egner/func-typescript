import {Result} from "../../../Result";
import {runInTry} from "../helpers";

/**
 * Maps the error in a failure Result using a handler map keyed by error name.
 *
 * If `prev` holds an error, this checks for a handler whose key matches
 * the error's constructor name and replaces the error with the handler's result.
 * When no handler matches or when `prev` is not an error, `prev` is returned unchanged.
 */
type ErrorHandlerMap = {
    [key: string]: (ex: Error) => Error | Promise<Error>;
};

export async function mapFailureWith(prev: Result, errorHandlers: ErrorHandlerMap): Promise<Result> {
    if(!prev.isError())
        return prev;

    const error = prev.getError()!;
    const errorName = error.constructor.name;

    if (errorHandlers[errorName]) {
        await runInTry(async () => {
            // @ts-ignore
            return prev.setError(await errorHandlers[errorName](error));
        }, prev);
    }

    return prev;
}