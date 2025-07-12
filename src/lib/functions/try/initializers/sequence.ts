import {Result} from "../../../Result";
import {Try} from "../../../Try";
import {runInTry} from "../helpers";



export async function sequence<T extends readonly unknown[]>(tries: { [K in keyof T]: Try<T[K]> }, parallel = false): Promise<Result>{
    const result = new Result();
    let values: unknown[] = [];

    const success = await runInTry(async () => {
        if(parallel){
            values =  await Promise.all(tries.map( values => values.get()))
        }else{
            for(const v of tries){
                values.push(await v.get());
            }
        }
    }, result)

    if(!success)
        return result;

    //@ts-ignore
    return result.setValue(values);

}