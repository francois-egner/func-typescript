import {Try} from "../../../Try";
import {runSteps} from "../helpers";

export async function get(tryObject: Try<unknown>){
    if(tryObject.$internal.isComputed){
        if(tryObject.$internal.finalResult?.isError())
            throw tryObject.$internal.finalResult.getError();

        return tryObject.$internal.finalResult!.getValue();
    }

    const finalResult = await runSteps(tryObject.$internal.steps);
    tryObject.$internal.finalResult = finalResult;
    tryObject.$internal.isComputed = true;

    if(finalResult.isError())
        throw finalResult.getError();

    return finalResult.getValue();
}