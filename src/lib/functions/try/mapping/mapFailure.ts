import {Result} from "../../../Result";
import {runInTry} from "../helpers";


/** Map the error when in failure using the provided function; ignore when successful. */
export async function mapFailure(prev: Result, func: (v: Error)=> Error | Promise<Error>): Promise<Result>{
    if(!prev.isError())
        return prev;

    await runInTry(async () => {
        prev.setError(await func(prev.getError()!));
    }, prev);

    return prev;

}