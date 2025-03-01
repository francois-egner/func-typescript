import {Result} from "../../Result";

export async function filter(prev: Result, predicate: (value: any) => Promise<boolean> | boolean) {
    if (!prev.getValue() || !predicate(prev.getValue()))
        return prev;

    prev.setValue(null);
    return prev;
}