import {Result} from "../../Result";

export async function whenWithProvider(prev: Result, provider: () => any){
    return new Result().setValue(await provider());
}