import {Result} from "../../Result";

export async function map<U>(prev: Result, mapper: (value: any) => (Promise<U> | U)){
    if(!prev.getValue())
        return prev;

    prev.setValue(await mapper(prev.getValue()));
    return prev;
}