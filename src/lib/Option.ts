import {Result} from "./Result";
import {NoSuchElementException} from "../exceptions/NoSuchElementException";
import {onEmpty} from "./functions/option/onEmpty";
import {whenWithProvider} from "./functions/option/whenWithProvider";
import {orElseWithProvider} from "./functions/option/orElseWithProvider";
import {peek} from "./functions/option/peek";
import { filter } from "./functions/option/filter";
import { map } from "./functions/option/map";
import { flatMap } from "./functions/option/flatMap";

export type Nullable = null | undefined;
export type OptionStep = ((() => Promise<any>) | ((prev: any) => Promise<any>))

export class Option<T> {


    public $internal: {finalResult: T | Nullable, steps: OptionStep[]} = {finalResult: undefined, steps: []}


    private constructor(steps: OptionStep[]) {
        this.$internal.steps = steps;
    }

    private static none(): Option<Nullable> {
        return new Option([(async () => new Result().setValue(null))]);
    }

    private static some<U>(value: U): Option<U> {
        return new Option([(async () => new Result().setValue(value))]);
    }

    public static of<T>(value: T): Option<T>;
    public static of(value: Nullable): Option<Nullable>;
    public static of<T>(value: T | Nullable): Option<T> | Option<Nullable> {
        return value == null ? Option.none() : Option.some(value);
    }


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

    public filter(predicate: (value: T) => Promise<boolean> | boolean): Option<T | Nullable> {
        return new Option([... this.$internal.steps, (prev: Result)=> filter(prev, predicate)]);
    }

    public map<U>(mapper: (value: T) => Promise<U> | U): Option<U | Nullable> {
        return new Option([... this.$internal.steps, (prev: Result)=> map(prev, mapper)]);
    }
    public flatMap<U>(mapper: (value: T) => Promise<Option<U | Nullable>> | Option<U | Nullable>): Option<U | Nullable> {
        return new Option([... this.$internal.steps, (prev: Result)=> flatMap(prev, mapper)]);
    }

    public async fold<U>(ifNone: () => Promise<U> | U, mapper: (value: T) => Promise<U> | U) : Promise<U>{
        // @ts-ignore
        return this.map(mapper).getOrElse(ifNone);
    }

    public async transform<U>(transformer: (opt: this) => Promise<U> | U): Promise<U>{
        return transformer(this)
    }

    public isEmpty(): boolean {
        return this.$internal.finalResult == null;
    }
    public isDefined(): boolean {
        return !this.isEmpty();
    }


    public async get(): Promise<Exclude<T, Nullable>> {
        await this.runSteps();

        if(this.isEmpty())
            throw new NoSuchElementException("No value present");

        return this.$internal.finalResult as Exclude<T, Nullable>;
    }
    public async run(): Promise<void>{
        await this.runSteps();
    }


    public async getOrElse<U>(value: Promise<U> | U): Promise<T | U>
    public async getOrElse<U>(value: () => Promise<U> | U): Promise<T | U>
    public async getOrElse<U>(value: U | (() => Promise<U> | U)): Promise<T | U> {
        await this.runSteps();

        if(this.isDefined())
            return this.$internal.finalResult!;

        // @ts-ignore
        return typeof value === "function" ? await value() as U : value as U;

    }
    public async getOrElseThrow(exceptionProvider: () => Error) : Promise<T> {
        await this.runSteps();

        if(this.isEmpty())
            throw exceptionProvider();

        return this.$internal.finalResult!;
    }


    public orElse<U>(value: Option<U>): Option<U | T>
    public orElse<U>(provider: () => Promise<Option<U>> | Option<U>): Option<U | T>
    public orElse<U>(value: (() => Promise<Option<U>> | Option<U>) | Option<U>): Option<U | T> {

        return typeof value === "function"
            ? new Option([... this.$internal.steps, (prev: Result)=> orElseWithProvider(prev, value)])
            : new Option([... this.$internal.steps, (prev: Result) => orElseWithProvider(prev, () => value)])

    }

    public peek(consumer: (value: Exclude<T, Nullable>) => Promise<unknown> | unknown) : Option<T>{
        return new Option([... this.$internal.steps, (prev: Result)=> peek(prev, consumer)])
    }

    public onEmpty(func: () => any): Option<T> {
        return new Option([...this.$internal.steps, (prev: Result)=> onEmpty(prev, func)])
    }


    private async runSteps(): Promise<void> {
        let result: Result = new Result();
        for (const step of this.$internal.steps) {
            result = await step(result);
        }
        this.$internal.finalResult = result.getValue();
    }



}