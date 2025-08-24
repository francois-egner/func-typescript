import {Try} from "../../../Try";
import {runSteps} from "../helpers";

/** Execute the Try and return the Try itself; throw if failed. */
export async function run(tryObject: Try<unknown>){
    if(tryObject.$internal.isComputed)
        return tryObject;

    const finalResult = await runSteps(tryObject.$internal.steps);
    tryObject.$internal.finalResult = finalResult;
    tryObject.$internal.isComputed = true;

    if(finalResult.isError())
        throw finalResult.getError();

    return tryObject;
}