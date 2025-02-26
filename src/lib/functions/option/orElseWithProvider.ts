import {Result} from "../../Result";
import {Option} from "../../Option";


export async function orElseWithProvider<U>(prev: Result, func: () => Promise<Option<U>> | Option<U>) : Promise<Result>{
    if(!prev.getValue())
        return new Result().setValue((await func()));

    return prev;
}