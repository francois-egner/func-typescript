import {Result} from "./Result";
import {NoSuchElementException} from "../exceptions/NoSuchElementException";
import {onEmpty} from "./functions/option/onEmpty";
import {whenWithProvider} from "./functions/option/whenWithProvider";
import {orElseWithProvider} from "./functions/option/orElseWithProvider";
import {peek} from "./functions/option/peek";
import { filter } from "./functions/option/filter";
import { map } from "./functions/option/map";
import { flatMap } from "./functions/option/flatMap";
import {Try} from "./Try";


/**
 * Represents a value that can either be `null` or `undefined`.
 *
 * This type is used to denote values that can explicitly be `null` or `undefined`,
 * allowing for better type safety and clearer intent when dealing with optional or missing values.
 *
 * @typedef {null | undefined} Nullable
 */
export type Nullable = null | undefined;


/**
 * Represents a step in the computation chain for an Option.
 *
 * This type defines the structure for a function that can either:
 * - Be a function returning a `Promise<any>`, representing a standalone asynchronous operation.
 * - Or be a function that takes the result of the previous step (`prev`) and returns a `Promise<any>`, allowing for a chained computation.
 *
 * The `OptionStep` type is used in contexts where computations are performed in a sequence, with each step relying on the result of the previous one.
 *
 * @typedef {Function} OptionStep
 * @param {(() => Promise<any>) | ((prev: any) => Promise<any>)} OptionStep
 * @returns {Promise<any>} A promise that resolves to any value from the computation.
 */
type OptionStep = ((() => Promise<any>) | ((prev: any) => Promise<any>))


/**
 * Represents a value that may or may not be present.
 *
 * The `Option<T>` class encapsulates the concept of an optional value in a type-safe way, inspired by
 * functional programming patterns. It can either contain a value (`some`), representing the presence of a value,
 * or be empty (`none`), representing the absence of a value. The class provides a series of methods to safely
 * manipulate and transform these values without the risk of `null` or `undefined` exceptions.
 *
 * Computations on `Option` instances are chained together, where each method call adds a step to the computation.
 * The computation chain is executed when methods like `runSteps` or `fold` are called.
 *
 * Typical usage includes:
 * - Encapsulating values that could be absent or nullable.
 * - Preventing `null`/`undefined` errors by working with Option objects explicitly.
 * - Transforming, filtering, and combining values in a functional style.
 *
 * @template T The type of the value held by the Option (if present).
 */
export class Option<T> {


    public $internal: {finalResult: T | Nullable, steps: OptionStep[]} = {finalResult: undefined, steps: []}

    private constructor(steps: OptionStep[]) {
        this.$internal.steps = steps;
    }



    /**
     * Creates an Option instance that represents the absence of a value.
     *
     * This static method returns an Option object signifying a "none" or empty state,
     * which is analogous to the absence of a value in functional programming.
     *
     * @returns {Option<Nullable>} An Option instance with no contained value.
     */
    public static none(): Option<Nullable> {
        return new Option([(async () => new Result().setValue(null))]);
    }


    /**
     * Creates an Option instance that contains a non-null value.
     *
     * This static method returns an Option object representing the presence of a value,
     * commonly referred to as a "some" state in functional programming. The method wraps
     * the provided value in an Option, indicating that it is present.
     *
     * @param {U} value - The value to be encapsulated in the Option.
     * @returns {Option<U>} An Option instance containing the specified value.
     */
    public static some<U>(value: U): Option<U> {
        return new Option([(async () => new Result().setValue(value))]);
    }


    /**
     * Creates an Option instance from the provided value.
     *
     * This static method returns an Option that encapsulates the given value if it is non-null,
     * or an empty Option (none) if the value is null or undefined.
     *
     * Overloaded forms:
     * - When a non-null value of type T is provided, returns an Option<T>.
     * - When a nullable value is provided, returns an Option<Nullable>.
     *
     * @param {T | Nullable} value - The value to be wrapped in an Option. If the value is null or undefined, an empty Option is returned.
     * @returns {Option<T> | Option<Nullable>} An Option instance containing the provided value if non-null, or representing a "none" state otherwise.
     */
    public static of<T>(value: T): Option<T>;
    public static of(value: Nullable): Option<Nullable>;
    public static of<T>(value: T | Nullable): Option<T> | Option<Nullable> {
        return value == null ? Option.none() : Option.some(value);
    }


    /**
     * Creates an Option instance conditionally.
     *
     * If the specified condition is true, this method returns an Option wrapping the provided value.
     * The value can be supplied either directly or via a supplier function for lazy evaluation.
     * If the condition is false, the method returns an empty Option (none).
     *
     * Overload specifics:
     * - When the value is a function (i.e., `() => U`), it is invoked only if the condition is true.
     * - When the value is provided directly as type U, it is used immediately if the condition is true.
     *
     * @template U The type of the value.
     * @param {boolean} condition - The condition to evaluate.
     * @param {U | (() => U)} value - The value or supplier function to wrap in an Option if the condition is true.
     * @returns {Option<U | Nullable>} An Option containing the result if the condition is true, or an empty Option if false.
     */
    public static when<U>(condition: boolean, value: () => U): Option<Nullable | U>
    public static when<U>(condition: boolean, value: U): Option<Nullable | U>
    public static when<U>(condition: boolean, value: U | (() => U)): Option<U | Nullable> {
        if (!condition) return Option.none();
        // @ts-ignore

        return typeof value === "function"
            // @ts-ignore
            ? new Option([async (prev)=> await whenWithProvider(prev, value)])
            : Option.some(value);
    }


    /**
     * Filters the contained value of this Option based on the provided predicate.
     *
     * The predicate function is applied to the value (if present), and it may return either a boolean
     * or a Promise that resolves to a boolean. If the predicate returns true (or resolves to true),
     * the Option remains unchanged; otherwise, an empty Option is returned.
     *
     * @param {(value: T) => Promise<boolean> | boolean} predicate - The function to test the contained value.
     * @returns {Option<T | Nullable>} An Option containing the value if the predicate returns true, or an empty Option otherwise.
     */
    public filter(predicate: (value: T) => Promise<boolean> | boolean): Option<T | Nullable> {
        return new Option([... this.$internal.steps, (prev: Result)=> filter(prev, predicate)]);
    }


    /**
     * Transforms the value contained within this Option using the provided mapper function.
     *
     * If the Option holds a value, the mapper function is applied to that value. The mapper may return
     * the new value either synchronously or as a Promise, allowing for asynchronous transformation.
     * If the Option is empty, the method returns an empty Option.
     *
     * @template U The type of the value returned by the mapper function.
     * @param {(value: T) => Promise<U> | U} mapper - The function to transform the contained value.
     * @returns {Option<U | Nullable>} An Option containing the transformed value if present, or an empty Option otherwise.
     */
    public map<U>(mapper: (value: T) => Promise<U> | U): Option<U | Nullable> {
        return new Option([... this.$internal.steps, (prev: Result)=> map(prev, mapper)]);
    }


    /**
     * Transforms the value contained within this Option using the provided mapper function,
     * capturing any exceptions in a Try.
     *
     * If the Option holds a value, the mapper function is applied to that value. If the function
     * executes successfully (or its returned Promise resolves), the result is wrapped in a Try.Success.
     * If the function throws an error or the Promise is rejected, the error is captured as a Try.Failure.
     *
     * @template U The type of the value returned by the mapper function.
     * @param {(value: T) => Promise<U> | U} mapper - The function to transform the contained value.
     * @returns {Try<U>} A Try instance containing the transformed value if successful, or the encountered error.
     */
    public mapTry<U>(mapper: (value: T) => Promise<U> | U): Try<U>{
        return Try.of(async ()=> {
            const result = await this.get();
            return mapper(result);
        })
    }


    /**
     * Transforms the contained value into another Option by applying the provided mapper function,
     * and then flattens the result to avoid nested Options.
     *
     * If this Option holds a value, the mapper function is applied to produce a new Option (or a Promise resolving to one).
     * The result is then flattened so that a single-level Option is returned.
     * If the Option is empty, it simply returns an empty Option.
     *
     * @template U The type of the value in the resulting Option.
     * @param {(value: T) => Promise<Option<U | Nullable>> | Option<U | Nullable>} mapper -
     *   The function to apply to the contained value, which returns an Option or a Promise that resolves to an Option.
     * @returns {Option<U | Nullable>} An Option containing the result of the mapping if a value was present, or an empty Option otherwise.
     */
    public flatMap<U>(mapper: (value: T) => Promise<Option<U | Nullable>> | Option<U | Nullable>): Option<U | Nullable> {
        return new Option([... this.$internal.steps, (prev: Result)=> flatMap(prev, mapper)]);
    }


    /**
     * Asynchronously folds the Option into a single value.
     *
     * This method evaluates the Option and returns a value based on its state. If the Option is empty,
     * it calls the `ifNone` function to provide a fallback value. If the Option contains a value,
     * it applies the `mapper` function to transform that value. Both the `ifNone` and `mapper`
     * functions may return a value directly or as a Promise.
     *
     * @template U The type of the resulting value.
     * @param {() => Promise<U> | U} ifNone - A function to produce a fallback value if the Option is empty.
     * @param {(value: T) => Promise<U> | U} mapper - A function to transform the contained value if it exists.
     * @returns {Promise<U>} A promise that resolves to the resulting value after applying the appropriate function.
     */
    public async fold<U>(ifNone: () => Promise<U> | U, mapper: (value: T) => Promise<U> | U) : Promise<U>{
        // @ts-ignore
        return this.map(mapper).getOrElse(ifNone);
    }



    /**
     * Transforms this Option using the provided transformer function.
     *
     * The transformer function receives this Option as an argument and returns either a transformed value
     * directly or a Promise resolving to one. This allows for flexible transformations, including handling both
     * present and empty Option cases.
     *
     * @template U The type of the resulting transformed value.
     * @param {(opt: this) => Promise<U> | U} transformer - A function that takes this Option and returns a transformed value.
     * @returns {Promise<U>} A promise that resolves to the transformed value.
     */
    public async transform<U>(transformer: (opt: this) => Promise<U> | U): Promise<U>{
        return transformer(this)
    }


    /**
     * Checks whether this Option is empty.
     *
     * Returns `true` if the Option does not contain a value (i.e., it represents "none"),
     * otherwise returns `false`.
     *
     * @returns {boolean} `true` if the Option is empty, `false` otherwise.
     */
    public isEmpty(): boolean {
        return this.$internal.finalResult == null;
    }


    /**
     * Checks whether this Option contains a value.
     *
     * Returns `true` if the Option holds a value (i.e., it represents "some"), otherwise returns `false`.
     *
     * @returns {boolean} `true` if the Option contains a value, `false` if it is empty.
     */
    public isDefined(): boolean {
        return !this.isEmpty();
    }



    /**
     * Retrieves the contained value of this Option.
     *
     * If the Option holds a value, it returns the value wrapped in a Promise.
     * If the Option is empty (i.e., `none`), it throws an error (NoSuchElementException).
     *
     * @throws {NoSuchElementException} If the Option is empty.
     * @returns {Promise<Exclude<T, Nullable>>} A promise resolving to the contained value if present.
     */
    public async get(): Promise<Exclude<T, Nullable>> {
        await this.runSteps();

        if(this.isEmpty())
            throw new NoSuchElementException("No value present");

        return this.$internal.finalResult as Exclude<T, Nullable>;
    }


    /**
     * Executes a side effect if this Option contains a value.
     *
     * If the Option holds a value, this method performs an asynchronous operation and resolves to `void`.
     * If the Option is empty, it does nothing.
     *
     * @returns {Promise<void>} A promise that resolves when the operation completes.
     */
    public async run(): Promise<void>{
        await this.runSteps();
    }


    /**
     * Asynchronously retrieves the contained value or returns a fallback value if the Option is empty.
     *
     * If the Option holds a value, it resolves to that value. If the Option is empty, it returns the provided
     * fallback value, which can be supplied either directly or via a function that returns it. The fallback
     * value can also be a Promise.
     *
     * Overload behavior:
     * - If `value` is a function, it is invoked only if the Option is empty.
     * - If `value` is a Promise, it is awaited before being returned.
     * - If `value` is a direct value, it is returned immediately when needed.
     *
     * @template U The type of the fallback value.
     * @param {U | (() => Promise<U> | U)} value - The fallback value or function to compute it.
     * @returns {Promise<T | U>} A promise resolving to the contained value if present, or the fallback value otherwise.
     */
    public async getOrElse<U>(value: Promise<U> | U): Promise<T | U>
    public async getOrElse<U>(value: () => Promise<U> | U): Promise<T | U>
    public async getOrElse<U>(value: U | (() => Promise<U> | U)): Promise<T | U> {
        await this.runSteps();

        if(this.isDefined())
            return this.$internal.finalResult!;

        // @ts-ignore
        return typeof value === "function" ? await value() as U : value as U;

    }


    /**
     * Retrieves the contained value or throws an error if the Option is empty.
     *
     * If the Option holds a value, it resolves to that value. If the Option is empty, it throws
     * the error provided by the `exceptionProvider` function, which can return an `Error` directly
     * or a `Promise<Error>`.
     *
     * @param {() => Promise<Error> | Error} exceptionProvider - A function that returns the error to be thrown.
     * @throws {Error} If the Option is empty.
     * @returns {Promise<T>} A promise resolving to the contained value if present.
     */
    public async getOrElseThrow(exceptionProvider: () => Promise<Error> | Error) : Promise<T> {
        await this.runSteps();

        if(this.isEmpty())
            throw await exceptionProvider();

        return this.$internal.finalResult!;
    }


    /**
     * Returns this Option if it contains a value; otherwise, returns the provided alternative Option.
     *
     * If this Option holds a value, it is returned unchanged. If it is empty, the provided alternative Option
     * is returned. The alternative can be supplied either directly as an `Option<U>` or as a function
     * returning an `Option<U>`, which may also be asynchronous.
     *
     * Overload behavior:
     * - If `value` is an `Option<U>`, it is returned if this Option is empty.
     * - If `value` is a function, it is invoked only if this Option is empty.
     * - If `value` is a function returning a `Promise<Option<U>>`, it is awaited before being returned.
     *
     * @template U The type of the alternative Option's value.
     * @param {(() => Promise<Option<U>> | Option<U>) | Option<U>} value -
     *   The alternative Option or a function that produces it.
     * @returns {Option<U | T>} This Option if non-empty, otherwise the provided alternative Option.
     */
    public orElse<U>(value: Option<U>): Option<U | T>
    public orElse<U>(provider: () => Promise<Option<U>> | Option<U>): Option<U | T>
    public orElse<U>(value: (() => Promise<Option<U>> | Option<U>) | Option<U>): Option<U | T> {

        return typeof value === "function"
            ? new Option([... this.$internal.steps, (prev: Result)=> orElseWithProvider(prev, value)])
            : new Option([... this.$internal.steps, (prev: Result) => orElseWithProvider(prev, () => value)])

    }


    /**
     * Performs a side effect on the contained value if this Option is non-empty, then returns the Option unchanged.
     *
     * If the Option holds a value, the `consumer` function is applied to it, allowing for operations such as logging or
     * asynchronous actions. The `consumer` function may return a value synchronously or as a Promise. However, the return
     * value of the `consumer` is ignored, and the original Option is returned.
     *
     * @param {(value: Exclude<T, Nullable>) => Promise<unknown> | unknown} consumer -
     *   A function to execute with the contained value if present.
     * @returns {Option<T>} This Option, unchanged.
     */
    public peek(consumer: (value: Exclude<T, Nullable>) => Promise<unknown> | unknown) : Option<T>{
        return new Option([... this.$internal.steps, (prev: Result)=> peek(prev, consumer)])
    }


    /**
     * Executes a side effect if this Option is empty, then returns the Option unchanged.
     *
     * If the Option is empty, the provided `func` is executed. This can be used for logging,
     * fallback actions, or triggering alternative logic when no value is present.
     * The return value of `func` is ignored.
     *
     * @param {() => any} func - A function to execute if the Option is empty.
     * @returns {Option<T>} This Option, unchanged.
     */
    public onEmpty(func: () => any): Option<T> {
        return new Option([...this.$internal.steps, (prev: Result)=> onEmpty(prev, func)])
    }


    /**
     * Executes the computation chain of this Option.
     *
     * This method triggers the execution of the entire sequence of operations that have been accumulated
     * through prior method calls. Each previous call to methods like `map`, `flatMap`, `filter`, etc.,
     * adds a step to this computation chain, which is executed when `runSteps` is invoked.
     *
     * @returns {Promise<void>} A promise that resolves once the entire computation chain has been executed.
     */
    private async runSteps(): Promise<void> {
        let result: Result = new Result();
        for (const step of this.$internal.steps) {
            result = await step(result);
        }
        this.$internal.finalResult = result.getValue();
    }



}