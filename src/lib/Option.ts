import {Result} from "./Result";
import {NoSuchElementException} from "../exceptions/NoSuchElementException";
import {onEmpty} from "./functions/option/onEmpty";
import {whenWithProvider} from "./functions/option/whenWithProvider";
import {orElseWithProvider} from "./functions/option/orElseWithProvider";

export type Nullable = null | undefined;
export type OptionStep = ((() => Promise<any>) | ((prev: any) => Promise<any>))

export class Option<T> {


    public $internal: {finalResult: T | Nullable, steps: OptionStep[]} = {finalResult: undefined, steps: []}


    private constructor(steps: OptionStep[]) {
        this.$internal.steps = steps;
    }

    private static none(): Option<Nullable>{
        return new Option([]);
    }

    private static some<U>(value: U): Option<U>{
        return new Option([(async ()=> new Result().setValue(value))]);
    }


    public static of<U>(value: U): Option<U | Nullable> {
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


    public isEmpty(): boolean {
        return this.$internal.finalResult == null;
    }
    public isDefined(): boolean {
        return !this.isEmpty();
    }


    public async get(): Promise<T> {
        await this.runSteps();

        if(this.isEmpty())
            throw new NoSuchElementException("No value present");

        return this.$internal.finalResult!;
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
        if(typeof value !== "function")
            value = ()=> (value as Option<U>);

        return new Option([... this.$internal.steps, (prev: Result)=> orElseWithProvider(prev, value)])
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