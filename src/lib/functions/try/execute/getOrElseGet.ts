import {Try} from "../../../Try";
import {runSteps} from "../helpers";

export async function getOrElseGet(tryObject: Try<unknown>, func: (err: Error) => any){
    if(tryObject.$internal.isComputed){
        if(tryObject.$internal.finalResult?.isError())
            return await func(tryObject.$internal.finalResult.getError()!);

        return tryObject.$internal.finalResult!.getValue();
    }

    const finalResult = await runSteps(tryObject.$internal.steps);
    tryObject.$internal.finalResult = finalResult;
    tryObject.$internal.isComputed = true;

    if(finalResult.isError())
        return await func(finalResult.getError()!);

    return finalResult.getValue();
}