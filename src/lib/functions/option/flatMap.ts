import {Result} from "../../Result";
import {Nullable, Option} from "../../Option";

export async function flatMap<U>(prev: Result, mapper: (value: any) => (Promise<Option<U | Nullable>> | Option<U | Nullable>)){
    if(!prev.getValue())
        return prev;

    const optionObject = await mapper(prev.getValue())

    prev.setValue(optionObject.get());
    return prev;
}