import {Result} from "../../../Result";
import {runInTry} from "../helpers";


/**
 * Initialize a Result by executing the provided function inside a guarded context.
 * Any thrown error becomes a failure; otherwise the returned value is stored.
 */
export async function of(func: () => any): Promise<Result> {
    const result = new Result();
    await runInTry(async ()=>{
        result.setValue(await func());
    }, result);

    return result;
}