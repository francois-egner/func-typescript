import {Result} from "../../../Result";
import {Try} from "../../../Try";
import {runInTry} from "../helpers";



export async function sequence<T extends readonly unknown[]>(tries: { [K in keyof T]: Try<T[K]> }): Promise<Result>{
    const result = new Result();
    const values: unknown[] = [];

    for(const v of tries){
        const success = await runInTry(async ()=>{
            values.push(await v.get());
        }, result);

        if(!success)
            return result;

    }

    //@ts-ignore
    return result.setValue(values);

}