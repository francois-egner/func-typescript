import {Result} from "../../../Result";
import {runInTry} from "../helpers";


/** Recover from a failure by producing a value; clears the error. */
export async function recover(prev: Result, func: (err: Error) => any): Promise<Result>{
    if(!prev.isError())
        return prev;

    await runInTry(async ()=>{
        prev.setValue(await func(prev.getError()!));
        prev.setError(undefined);
    }, prev);

    return prev;

}