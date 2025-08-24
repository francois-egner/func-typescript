import {Result} from "../../../Result";
import {runInTry} from "../helpers";


/** Perform a side-effect when successful; leave Result unchanged. */
export async function onSuccess(prev: Result, func: (v: any) => Promise<void> | void): Promise<Result>{
    if(prev.isError())
        return prev;

    await runInTry(async ()=>{
        await func(prev.getValue());
    }, prev);

    return prev;

}