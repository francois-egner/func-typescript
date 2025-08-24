import {Result} from "../../../Result";
import {runInTry} from "../helpers";


/** Map the successful value with `func`; if in error, return unchanged. */
export async function map(prev: Result, func: (v: any)=> any): Promise<Result>{
    if(prev.isError())
        return prev;

    await runInTry(async () => {
        prev.setValue(await func(prev.getValue()));
    }, prev);

    return prev;

}