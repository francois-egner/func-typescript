import {Result} from "../../Result";


export async function peek(prev: Result, consumer: (value: any) => Promise<unknown> | unknown) {
    if(!prev.getValue())
        return prev;

    await consumer(prev.getValue())
    return prev;
}
