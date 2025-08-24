import {Result} from "../../../Result";
import {runInTry} from "../helpers";


/** Perform a side-effect regardless of success/failure; leave Result unchanged. */
export async function andFinally(prev: Result, func: (v: any) => Promise<void> | void): Promise<Result>{
    await runInTry(async ()=>{
        await func(prev.getValue());
    }, prev);

    return prev;

}