import {Step, Try} from "../../../Try";
import {Result} from "../../../Result";
import {runSteps} from "../helpers";

export async function getOrElseThrow(tryObject: Try<unknown>, func: (err: Error) => Promise<Error> | Error){
    if(tryObject.$internal.isComputed){
        if(tryObject.$internal.finalResult?.isError())
            throw await func(tryObject.$internal.finalResult.getError()!);

        return tryObject.$internal.finalResult!.getValue();
    }

    const finalResult = await runSteps(tryObject.$internal.steps);
    tryObject.$internal.finalResult = finalResult;
    tryObject.$internal.isComputed = true;

    if(finalResult.isError())
        throw await func(finalResult.getError()!)
    return finalResult.getValue();
}