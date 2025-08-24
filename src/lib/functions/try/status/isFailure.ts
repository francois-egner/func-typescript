import {Result} from "../../../Result";

/** True when an error is present. */
export async function isFailure(prev: Result): Promise<boolean>{
    return prev.isError();
}