/**
 * Lightweight container used internally by Try/Option function pipelines.
 *
 * A Result holds either a computed value or an error. Helper functions
 * in `src/lib/functions` read and write this container during execution.
 *
 * This is not part of the public API and may change without notice.
 */
export class Result {
    private value: any | undefined;
    private error: Error | undefined;

    constructor() {
        this.value = undefined;
        this.error = undefined;
    }

    /** Store a successful value and clear any error. */
    public setValue(value: any | undefined): Result {this.value = value; this.error = undefined; return this;}

    /** Retrieve the stored successful value (if any). */
    public getValue(): any | undefined {return this.value;}

    /** Store an error and clear any value. */
    public setError(error: any | undefined): Result {this.error = error; if (error !== undefined) this.value = undefined; return this;}

    /** Retrieve the stored error (if any). */
    public getError(): Error | undefined {return this.error;}

    /** True when an error is present. */
    public isError(): boolean {return this.error != undefined;}

    /** True when a value is present (legacy name kept for compatibility). */
    public hasvalue(): boolean {return this.error == undefined;}
}