import {Result} from "../../../Result";

/** True when no error is present. */
export async function isSuccess(prev: Result): Promise<boolean>{
    return !prev.isError();
}