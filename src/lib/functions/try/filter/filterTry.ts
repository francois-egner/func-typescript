import {Result} from "../../../Result";
import {NoSuchElementException} from "../../../../exceptions/NoSuchElementException";
import {runInTry} from "../helpers";
import { Try } from "../../../Try";


export async function filterTry<T>(prev: Result, predicate: (value: T) => Try<boolean> | Promise<Try<boolean>>, func?: (v: T) => Promise<Error> | Error): Promise<Result>{
    await runInTry(async ()=>{
        if(prev.isError() || !await (await predicate(prev.getValue())).get())
            return prev;

        if(func){
            return prev.setError(await func(prev.getValue()));
        }
        prev.setError(new NoSuchElementException(`Predicate does not hold for ${prev.getValue()}`));
    }, prev);

    return prev;
}