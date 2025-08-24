import {Result} from "../../../Result";
import {runInTry} from "../helpers";


/** Perform a side-effect when in failure; leave Result unchanged. */
export async function onFailure(prev: Result, func: (v: Error) => Promise<void> | void): Promise<Result>{
    if(!prev.isError())
        return prev;

    await runInTry(async ()=>{
        await func(prev.getError()!);
    }, prev);

    return prev;

}