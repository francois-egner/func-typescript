/**
 * Represents an exception that is thrown when an element is not found.
 *
 * This custom error class extends the built-in `Error` class and provides a specific error type,
 * `NoSuchElementException`, to indicate that a required element could not be found.
 * It is used by Option/Try operations that require a value but none is present (e.g. `Option.get()`)
 * or by filter operations when no custom error is supplied.
 *
 * @extends {Error}
 */
export class NoSuchElementException extends Error {
    /**
     * Creates an instance of `NoSuchElementException`.
     *
     * @param {string} message The error message describing the specific failure.
     */
    constructor(message: string) {
        super(message);
        this.name = "NoSuchElementException";
    }
}