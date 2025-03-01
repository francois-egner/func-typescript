import {Result} from "../../Result";


export async function onEmpty(prev: Result, func: ()=> any){
    if (!prev.getValue())
        await func();
    return prev
}