import {Result} from "../../../Result";
import { Try } from "../../../Try";
import {runInTry} from "../helpers";


/** Perform a Try-producing side-effect regardless of success/failure; leave Result unchanged. */
export async function andFinallyTry(prev: Result, func: (v: any) => Promise<Try<void>> | Try<void>): Promise<Result>{
    await runInTry(async ()=>{
        await (await func(prev.getValue())).run();
    }, prev);

    return prev;

}