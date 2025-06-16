import {Try} from "../../../Try";
import {runSteps} from "../helpers";

export async function getOrElse(tryObject: Try<unknown>, fallbackValue: any){
    if(tryObject.$internal.isComputed){
        if(tryObject.$internal.finalResult?.isError())
            return fallbackValue;

        return tryObject.$internal.finalResult!.getValue();
    }

    const finalResult = await runSteps(tryObject.$internal.steps);
    tryObject.$internal.finalResult = finalResult;
    tryObject.$internal.isComputed = true;

    if(finalResult.isError())
        return fallbackValue;

    return finalResult.getValue();
}