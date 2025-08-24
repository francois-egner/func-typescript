import {Result} from "../../../Result";


/** Create a failed Result with the given error. */
export async function failure(err: Error): Promise<Result> {
    return new Result().setError(err);
}