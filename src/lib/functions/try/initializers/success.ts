import {Result} from "../../../Result";


/** Create a successful Result with the given value. */
export async function success(value: any): Promise<Result> {
    return new Result().setValue(value);
}