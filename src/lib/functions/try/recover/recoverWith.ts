import {Result} from "../../../Result";
import {Try} from "../../../Try";
import {runInTry} from "../helpers";


/** Recover from a failure by producing a Try; flattens the inner Try and clears the error. */
export async function recoverWith(prev: Result, func: (err: Error) => Try<any> | Promise<Try<any>>): Promise<Result>{
    if(!prev.isError())
        return prev

    await runInTry(async ()=>{
        const tryObject = await func(prev.getError()!);
        prev.setValue(await tryObject.get());
        prev.setError(undefined);
    }, prev);

    return prev;

}