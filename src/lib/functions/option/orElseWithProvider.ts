import {Result} from "../../Result";
import {Option} from "../../Option";


export async function orElseWithProvider<U>(prev: Result, func: () => Promise<Option<U>> | Option<U>) : Promise<Result>{
    if(!prev.getValue()){
        const optionObject = await func();
        return new Result().setValue(optionObject.get());
    }

    return prev;
}