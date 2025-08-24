import {Result} from "../../Result";
import {Step} from "../../Try";



/**
 * Execute a sequence of Try steps, threading a Result through them.
 * Used by execution functions (get/run and variants).
 */
export async function runSteps(steps: Step[]): Promise<Result> {
    let result: Result = new Result();
    for (const step of steps) {
        result = await step(result);
    }
    return result;
}

/**
 * Helper to run a function and capture thrown errors into the provided Result.
 * When ignoreException is true, errors are swallowed.
 */
export async function runInTry(func: ()=> Promise<Result | void>, prev: Result, ignoreException = false){
    try{
        await func();
        return true;
    }catch(err: unknown){
        if(!ignoreException)
            prev.setError(err);
        return false;
    }
}