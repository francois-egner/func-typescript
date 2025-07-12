import {Result} from "../../../Result";
import {Try} from "../../../Try";
import {runInTry} from "../helpers";



export async function combine<T extends any[], R>(...args: [...{ [K in keyof T]: Try<T[K]> }, (...values: T) => R]): Promise<Result>;
export async function combine<T extends any[], R>(...args: [...{ [K in keyof T]: Try<T[K]> }, (...values: T) => R, boolean]): Promise<Result>;
export async function combine<T extends any[], R>(...args: any[]): Promise<Result>{
    const result = new Result();
    // Check if the last argument is a boolean (parallel flag)
    const hasParallelFlag = typeof args[args.length - 1] === 'boolean';
    const tries = args.slice(0, hasParallelFlag ? -2 : -1) as { [K in keyof T]: Try<T[K]> };
    const func = args[hasParallelFlag ? args.length - 2 : args.length - 1] as (...values: T) => R;
    const parallel = hasParallelFlag ? (args[args.length - 1] as boolean) : true;
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
    return result.setValue(await func(...values));

    /* for(const v of tries){
        const success = await runInTry(async ()=>{
            values.push(await v.get());
        }, result);

        if(!success)
            return result;

    }

    //@ts-ignore
    return result.setValue(await func(...values)); */

}