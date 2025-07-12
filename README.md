# func-typescript 🚀

You can find this library on:
- NPM: [func-typescript](https://www.npmjs.com/package/func-typescript)
- JSR: [func-typescript](https://jsr.io/@francois-egner/func-typescript)


## A modern JavaScript/TypeScript library for handling computations that may result in success or failure, and working with optional values in an asynchronous context. This library provides functional constructs inspired by functional programming languages, but tailored for JavaScript/TypeScript developers.


## Features

### 1. Try
- Represents a computation that may result in either a success or failure.
- Provides methods to handle success and failure in a functional way, without throwing exceptions.
- Works seamlessly with async functions and Promises.
- Tracks the computation steps for better debugging and error handling.

### 2. Option
- Represents a value that may or may not be present.
- Provides methods to safely manipulate and transform these values without the risk of `null` or `undefined` exceptions.
- Supports chaining of operations and async transformations.
- Can be used to handle optional values in a type-safe way.

### 3. Async Support
- All methods are designed to work with async functions and Promises.
- Provides first-class support for asynchronous computations.
- Handles errors and optional values in an async context.

### 4. Chaining
- Methods can be chained together to create complex computations.
- Each method adds a step to the computation chain, which can be executed later.
- Supports both synchronous and asynchronous chaining.

### 5. Error Handling
- Provides methods to recover from failures and transform errors.
- Can handle errors in a functional way, without using try-catch blocks.
- Supports async error recovery.

### 6. Optional Values
- Provides methods to handle optional values in a type-safe way.
- Avoids `null` and `undefined` issues by using the `Option` type.
- Supports async transformations and chaining.

## Getting Started

### Installation
```bash
npm install func-typescript
```

### Example Usage

Here's an example of how to use the Try and Option classes together:

```typescript
import { Try, Option } from 'func-typescript';

// Example: Async function that may throw an error or return null
const fetchUser = async (id: string) => {
  // Some async operation that may throw an error or return null
  if (id === '123') {
    return { name: 'Alice' };
  } else {
    throw new Error('User not found');
  }
};

// Wrap the async function in a Try
const result = Try.of(() => fetchUser('123'));

// Handle success and failure
result
  .map(user => user.name)
  .recover(error => 'Default user')
  .andThen(console.log) // Output: 'Alice'
  .run();
  

// Example: Using Option to handle optional values
const maybeUser = Option.of(fetchUser('456'));

maybeUser
  .map(user => user.name)
  .getOrElse('Default user')
```

## API Documentation

### Try
## Initialization functions

### `static of<T>(func: () => T | Promise<T>): Try<T>`
Creates a Try instance from a function that may throw an error.
```typescript
const of = await Try.of(() => {
  if (Math.random() > 0.5) {
    return 10;
  } else {
    throw new Error('An error occurred');
  }
}).get(); // => 10 or throws 'An error occurred'
```
<br>


### `static combine<T extends any[], R>(...args: [...{ [K in keyof T]: Try<T[K]> }, (...values: T) => R | Promise<R>, boolean?]): Try<R>`
Sometimes you may want to combine multiple Try instances into one. This function allows you to do that. It takes multiple Try instances and a function that will be executed if all Try instances are successful. If one of the Try instances is a failure, the function will not be executed and the resulting Try instance will be a failure. 

The last parameter is an optional boolean that controls whether the Try instances should be executed in parallel (`true`) or sequentially (`false`). By default, they are executed in parallel. <br>
```typescript
//All passed Try instances are successful (parallel execution by default)
const r = Try.success(2);
const r2 = Try.success(3);
const r3 = Try.of(() => {
  if(0.6 > 0.5) return "3";
  throw new Error("Random error");
});

const f = (a: number, b: number, c: string) => a + b + c;

const r4 = await Try.combine(r, r2, r3, f).get(); //=> "53" ;

//Sequential execution
const r4_sequential = await Try.combine(r, r2, r3, f, false).get(); //=> "53" ;

//Parallel execution (explicit)
const r4_parallel = await Try.combine(r, r2, r3, f, true).get(); //=> "53" ;

//One of the passed Try instances is a failure
const r = Try.success(2);
const r2 = Try.success(3);
const r3 = Try.of(() => {
  if(0.3 > 0.5) return "3";
  throw new Error("Random error");
}); //=> Is a Failure

const f = (a: number, b: number, c: string) => a + b + c;

const r4 = Try.combine(r, r2, r3, f);

await r4.get(); //=> Will throw 'Random error'
```
<br>


### `static sequence<T extends readonly unknown[]>(tries: { [K in keyof T]: Try<T[K]> }, parallel?: boolean): Try<T>`
Runs all tries provided and returns their results in an array. The second parameter controls whether the Tries are run in parallel (`true`) or sequentially (`false`). By default, they are run sequentially.

```typescript
//All passed Try instances are successful (sequential execution by default)
const r = Try.success(2);
const r2 = Try.success(3);
const r3 = Try.success("4");

const r4 = await Try.sequence([r, r2, r3]).get(); //-> [2,3,"4"]

//Sequential execution (explicit)
const r4_sequential = await Try.sequence([r, r2, r3], false).get(); //-> [2,3,"4"]

//Parallel execution
const r4_parallel = await Try.sequence([r, r2, r3], true).get(); //-> [2,3,"4"]

//One of the passed Try instances is a failure
const r = Try.success(2);
const r2 = Try.success(3);
const r3 = Try.of(() => {
if(0.3 > 0.5) return "3";
throw new Error("Random error");
});

const r4 = await Try.sequence([r, r2, r3]).get(); //=> Will throw 'Random error'

```

### `success<U>(value:U): Try<U>`
Creates a Try instance with a successful value.
```typescript
const success = await Try.success(10).get(); // => 10
```

<br>

### `failure<T>(error: Error): Try<T>`
Creates a Try instance with a failure value.
```typescript
const failure = await Try.failure(new Error('An error occurred')).get(); // => Will throw 'An error occurred'
```


## Execution functions
**This library will not run chained methods when they are called inside your code. You need to call a so called execution method to start executing the methods chain. This is necessary because of the nature of promises. Execution methods are async because they will run the async functions provided to chaining methods like `map`, `recover`, ...** <br>
If you just want to run the Try instance method chain without returning any value, you can use the `run` method. If you want to get the value of the Try instance, you can use the `get` method.

To give you an example, let's say you have a Try instance like below:
```typescript
const tryInstance = Try.success(10)
    .map(v => v + 1)
    .filter(v => v > 5)
    .recover(() => 0);
```
If you want to get the value of the computation of all methods, you can use the `get` method like below:
```typescript
const value = await tryInstance.get(); // => 11
```
Internally `get` will run all the methods in the chain: `map`, `filter`, `recover` and return the value of the Try instance. If you want to run the methods chain without getting the value, you can use the `run` method like below:
```typescript
await tryInstance.run(); // => Will run all the functions in the chain without returning the value.
```

<br><br>

### `get(): Promise<T>`
Gets the value of the Try instance. If the Try instance is a Failure, it will throw the error.<br> **Due to the nature of this library and potential asynchronous methods passed to transformation methods,
it is necessary to await the result of this function.**
```typescript
//Sucess
const value = await Try.success(10).get(); // => 10

//Failure
const failure = await Try.failure(new Error('An error occurred')).get(); // => Will throw 'An error occurred'
```

<br>

### `run(): Promise<Try<T>>`
Runs the Try instance and returns the Try instance itself. This is executing a Try instance if no returned value is expected. <br>
**Due to the nature of this library and potential asynchronous operations passed to transformation methods, it is necessary to await the result of this function.**
```typescript
//Success
const sucess = await Try.success(10).run(); // => Try instance with calculated value 10

//Failure
const failure = await Try.failure(new Error('An error occurred')).run(); // => Try instance with error 'An error occurred'

//Useful case
await Try.success(1)
        .filter(v => v > 2, v => { throw new Error("Custom Predicate does not hold for " + v)})
        .run(); //Will throw the custom error
```

<br>


### `getOrElse<U>(defaultValue: U): Promise<U | T>`
Returns the value of the Try instance if it is a Success, otherwise returns the default value.<br>
**Due to the nature of this library and potential asynchronous operations passed to transformation methods, it is necessary to await the result of this function.**
```typescript
//Success
const value = await Try.success(10).getOrElse(0); // => 10

//Failure
const failure = await Try.failure(new Error('An error occurred')).getOrElse(0); // => 0
```

<br>

### `getOrElseGet<U>(func: (ex: Error) => U | Promise<U>): Promise<T | U>`
Returns the value of the Try instance if it is a Success, otherwise returns the value returned by the function.
```typescript
//Success
const value = await Try.success(10).getOrElseGet(() => 0); // => 10

//Failure
const failure = await Try.failure(new Error('An error occurred')).getOrElseGet(() => 0); // => 0
```

<br>

### `getOrElseThrow(func: (error: Error) => Promise<Error> | Error): Promise<T>`
Returns the value of the Try instance if it is a Success, otherwise throws the error returned by the function.
```typescript
//Success
const value = await Try.success(10).getOrElseThrow(() => new Error('An error occurred')); // => 10

//Failure
const failure = await Try.failure(new Error('An error occurred')).getOrElseThrow(() => new Error('Another error occurred')); // => Will throw 'Another error occurred'
```

<br>

## Other functions

### `isSuccess(): boolean`
Returns true if the Try instance is a Success, otherwise returns false.
```typescript
//Success
const success = Try.success(10).isSuccess(); // => true

//Failure
const failure = Try.failure(new Error('An error occurred')).run().isSuccess(); // => false
```

<br>

### `isFailure(): boolean`
Returns true if the Try instance is a Failure, otherwise returns false.
```typescript
//Success
const success = Try.success(10).isFailure(); // => false

//Failure
const failure = Try.failure(new Error('An error occurred')).run().isFailure(); // => true
```

<br>

### `map<U>(func: (value: T) => U | Promise<U>): Try<U>`
Maps the value of the Try instance if it is a Success, otherwise returns the Failure instance.
```typescript
//Success
const value = await Try.success(10)
        .map(v => v + 1)
        .get(); // => 11

//Failure
const failure = await Try.failure(new Error('An error occurred'))
        .map(v => v + 1)
        .get(); // => Will throw 'An error occurred'
```
<br>

### `mapIf<U>(predicateFunc: (value: T) => boolean | Promise<boolean>, func: (value: T) => U | Promise<U>): Try<U>`
Maps the value of the Try instance if it is a Success and the predicate function evaluates to true. If not, the original state will be returned.
```typescript
//Success
const value = await Try.success(10)
        .mapIf((v)=> v % 2 === 0, v => v + 1)
        .get(); // => 11

const value = await Try.success(21)
        .mapIf((v)=> v % 2 === 0, v => v + 1)
        .get(); // => 21

//Failure
const failure = await Try.failure(new Error('An error occurred'))
        .mapIf((v)=> v % 2 === 0, v => v + 1)
        .get(); // => Will throw 'An error occurred'
```

<br>


### `flatMap<U>(func: (value: T) => Try<U> | Promise<Try<U>>): Try<U>`
Maps the value of the Try instance if it is a Success, otherwise returns the Failure instance.
```typescript
//Success
const value = await Try.success(10)
        .flatMap(v => Try.success(v + 1))
        .get(); // => 11

//Failure
const failure = await Try.failure(new Error('An error occurred'))
        .flatMap(v => Try.success(v + 1))
        .get(); // => Will throw 'An error occurred'
```
<br>

### `flatMapIf<U>(predicateFunc: (value: T) => boolean | Promise<boolean>, func: (value: T) => Try<U> | Promise<Try<U>>): Try<U>`
Maps the value of the Try instance if it is a Success and the predicate is true. If not, the original state will be returned.
```typescript
//Success
const value = await Try.success(10)
        .flatMapIf((v)=> v % 2 === 0, v => Try.success(v + 1))
        .get(); // => 11

const value = await Try.success(21)
        .flatMapIf((v)=> v % 2 === 0, v => Try.success(v + 1))
        .get(); // => 21

//Failure
const failure = await Try.failure(new Error('An error occurred'))
        .flatMapIf((v)=> v % 2 === 0, v => Try.success(v + 1))
        .get(); // => Will throw 'An error occurred'
```

<br>

### `mapFailure(func: (ex: Error) => Error | Promise<Error>): Try<T>`
Maps a failure of the Try instance if it is a Failure, otherwise returns the Success instance.
```typescript
class CustomException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomException";
  }
}

class MappedCustomException extends Error {
  cause: string;
  constructor(message: string, cause: string) {
    super(message);
    this.cause = cause;
    this.name = "MappedCustomException";
  }
}


  const result = Try.failure(new CustomException("This is a test!"))
          .mapFailure(async (_)=> new MappedCustomException("Mapped Custom Exception", "Custom Exception"))
});
```

<br>

### `mapFailureWith<E extends Error, U extends Error>(errorType: new (...args: any[]) => E, func: (ex: E) => U | Promise<U>): Try<T>`
Maps a failure of the Try instance if it is a specific error type using a function provided with the previous error if it is a Failure, otherwise returns the Success instance.
```typescript
class CustomException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomException";
  }
}

class MappedCustomException extends Error {
  cause: string;
  constructor(message: string, cause: string) {
    super(message);
    this.cause = cause;
    this.name = "MappedCustomException";
  }
}


const result = Try.failure(new CustomException("This is a test!"))
        .mapFailureWith(CustomException, async (err) => {
          return new MappedCustomException("Mapped Custom Exception", err.message);
        });
await expect(result.get()).rejects.toThrow(MappedCustomException);
expect(result.isSuccess()).toBe(false);

```

<br>

### `recover<U>(func: (error: Error) => U | Promise<U>): Try<T | U>`
Recovers the value of the Try instance if it is a Failure, otherwise returns the Success instance.
```typescript
//Success
const value = await Try.success(10)
        .recover(() => 0)
        .get(); // => 10
        
//Failure
const failure = await Try.failure(new Error('An error occurred'))
        .recover(() => 0)
        .get(); // => 0
```


<br>

### `recoverWith<U>(func: (error: Error) => Try<U> | Promise<Try<U>>): Try<U | T>`
Recovers the value of the Try instance if it is a Failure, otherwise returns the Success instance.
```typescript
//Success
const value = await Try.success(10)
        .recoverWith(() => Try.success(0))
        .get(); // => 10
        
//Failure
const failure = await Try.failure(new Error('An error occurred'))
        .recoverWith(() => Try.success(0))
        .get(); // => 0
```


<br>

### `andThen(func: (value: T) => Promise<any> | any): Try<T>`
Runs the function if the Try instance is a Success.
```typescript
//Success
const value = await Try.success(10)
        .andThen(v => console.log(v)) // => Will print 10
        .get(); // => 10

//Failure
const failure = await Try.failure(new Error('An error occurred'))
        .andThen(v => console.log(v)) // => Will print nothing
        .get(); // => Will throw 'An error occurred'
```
<br>

### `andThenTry(func: (value: T) => Promise<Try<any>> | Try<any>): Try<T>`
Runs the function if the Try instance is a Success.
```typescript
//Success
const value = await Try.success(10)
        .andThen(v => Try.of(()=>console.log(v))) // => Will print 10
        .get(); // => 10

//Failure
const failure = await Try.failure(new Error('An error occurred'))
        .andThenTry(v => Try.of(() => console.log(v))) // => Will print nothing
        .get(); // => Will throw 'An error occurred'
```
<br>

### `andFinally(func: () => Promise<any> | any): Try<T>`
Runs the function no matter the internal state (success or failure).
```typescript
//Success
let v_success;
const success = Try.of(() => 5).andFinally(()=>{v_success = 10}); // => will set the value of v to 10


//Failure
let v_failure;
const failure = Try.failure(new Error("5")).andFinally(()=>{v_failure = 10}); // => will set the value of v to 10, despite being a failure
```


<br>

### `andFinallyTry(func: () => Promise<Try<any>> | Try<any>): Try<T>`
Runs the function no matter the internal state (success or failure).
```typescript
//Success
let v_success;
const success = Try.of(() => 5).andFinallyTry(()=>Try.of(() => {v_success = 10})); // => will set the value of v to 10


//Failure
let v_failure;
const failure = Try.failure(new Error("5")).andFinallyTry(()=>Try.of(() => {v_failure = 10})); // => will set the value of v to 10, despite being a failure
```


<br>


### `filter(predicateFunc: (value: T) => boolean | Promise<boolean>, errorProvider?: (value: T) => Error): Try<T>`
Will throw default or custom Error if predicate is true.
```typescript
//Failure
const value = await Try.success(10)
        .filter(v => v > 5)
        .get(); // => Will throw 'Predicate does not hold for 10'
        
//Sucess
const failure = await Try.success(10)
        .filter(v => v > 15)
        .get(); // => 10

//Failure with custom error
const failureWithCustomError = await Try.success(10)
        .filter(v => v > 5, v => { throw new Error("Custom Predicate does not hold for " + v)})
        .get(); // => Will throw 'Custom Predicate does not hold for 10'
```

<br>

### `filterTry(predicateFunc: (value: T) => Try<boolean> | Promise<Try<boolean>>, errorProvider?: (value: T) => Error): Try<T>`
Will throw default or custom Error if predicate is true.
```typescript
//Failure
const value = await Try.success(10)
        .filter(v => Try.success(v > 5))
        .get(); // => Will throw 'Predicate does not hold for 10'
        
//Sucess
const failure = await Try.success(10)
        .filter(v => Try.success(v > 15))
        .get(); // => 10

//Failure with custom error
const failureWithCustomError = await Try.success(10)
        .filter(v => Try.success(v > 5), v => { throw new Error("Custom Predicate does not hold for " + v)})
        .get(); // => Will throw 'Custom Predicate does not hold for 10'
```


<br>

### `filterNot(predicateFunc: (value: T) => boolean | Promise<boolean>, errorProvider?: (value: T) => Error): Try<T>`
Will throw default or custom Error if predicate is false.
```typescript
//Failure
const value = await Try.success(10)
        .filterNot(v => v > 15)
        .get(); // => Will throw 'Predicate holds for 10'

//Success
const failure = await Try.success(10)
        .filterNot(v => v > 5)
        .get(); // => 10

//Failure with custom error
const failureWithCustomException = await Try.success(10)
        .filterNot(v => v > 15, v => { throw new Error("Custom Predicate holds for " + v)})
        .get(); // => Will throw 'Custom Predicate holds for 10'
```

<br>

### `filterNotTry(predicateFunc: (value: T) => Try<boolean> | Promise<Try<boolean>>, errorProvider?: (value: T) => Error): Try<T>`
Will throw default or custom Error if predicate is false.
```typescript
//Failure
const value = await Try.success(10)
        .filterNot(v => Try.success(v > 15))
        .get(); // => Will throw 'Predicate holds for 10'

//Success
const failure = await Try.success(10)
        .filterNot(v => Try.success(v > 5))
        .get(); // => 10

//Failure with custom error
const failureWithCustomException = await Try.success(10)
        .filterNot(v => Try.success(v > 15), v => { throw new Error("Custom Predicate holds for " + v)})
        .get(); // => Will throw 'Custom Predicate holds for 10'
```

<br>

### `onFailure(func: (value: Error) => Promise<any> | any): Try<T>`
Runs the function if the Try instance is a Failure.
```typescript
//Success
const value = await Try.success(10)
        .onFailure(ex => console.log(ex)) // => Will not print
        .get(); // => 10
        
//Failure
const failure = await Try.failure(new Error('An error occurred'))
        .onFailure(ex => console.log(ex)) // => Will print 'An error occurred'
        .run(); 
```


<br>

### `onSuccess(func: (value: T) => Promise<any> | any): Try<T>`
Runs the function if the Try instance is a Success.
```typescript
//Success
const value = await Try.success(10)
        .onSuccess(v => console.log(v)) // => Will print 10
        .get(); // => 10
        
        
//Failure
const failure = await Try.failure(new Error('An error occurred'))
        .onSuccess(v => console.log(v)) // => Will not print
        .get(); // => Will throw 'An error occurred'
```

<br>

### `getCause(): Error | undefined`
Returns the error of the Try instance if it is a Failure, otherwise returns undefined.
```typescript
//Success
const value = (await Try.success(10).run()).getCause(); // => undefined

//Failure
const failure = Try.failure(new Error('An error occurred')).getCause(); // => Error('An error occurred')
```


<br>

### `peek(func: (value: T) => Promise<any> | any): Try<T>`
Peeks the value of the Try instance if it is a Success, otherwise returns the Failure instance.
```typescript
//Success
const value = await Try.success(10)
        .peek(v => console.log(v)) // => Will print 10
        .get(); // => 10

//Failure
const failure = await Try.failure(new Error('An error occurred'))
        .peek(v => console.log(v)) // => Will not print
        .get(); // => Will throw 'An error occurred'
```

## Option Class

The `Option` class is designed to handle optional values in a type-safe and functional way. It represents a value that may or may not be present, allowing you to work with potentially missing values without the risk of `null` or `undefined` errors. The class provides a series of methods to safely manipulate and transform these values.

### Initialization Functions

#### `some<U>(value: U): Option<U>`
Creates an Option instance that contains a non-null value.

**Example:**
```typescript
const someValue = Option.some(10);
// someValue is an Option<number> containing 10
```

#### `none(): Option<Nullable>`
Creates an Option instance that represents the absence of a value.

**Example:**
```typescript
const noneValue = Option.none();
// noneValue is an Option<Nullable> representing no value
```

#### `of<T>(value: T): Option<T> | Option<Nullable>`
Creates an Option instance from the provided value. If the value is `null` or `undefined`, it returns an empty Option.

**Example:**
```typescript
const someValue = Option.of(10); // Option<number> containing 10
const noneValue = Option.of(null); // Option<Nullable> representing no value
```

#### `when<U>(condition: boolean, value: U | (() => U)): Option<U | Nullable>`
Creates an Option instance conditionally. If the condition is true, it returns an Option wrapping the provided value. If the condition is false, it returns an empty Option.

**Example:**
```typescript
const value = Option.when(true, 10); // Option<number> containing 10
const none = Option.when(false, 10); // Option<Nullable> representing no value
```

### Execution Functions

#### `run(): Promise<Option<T>>`
Executes the computation chain of this Option. This method triggers the execution of the entire sequence of operations that have been accumulated through prior method calls.

**Example:**
```typescript
const option = Option.of(10)
  .map(v => v * 2)
  .filter(v => v > 5);

await option.run();
```

#### `get(): Promise<Exclude<T, Nullable>>`
Retrieves the contained value of this Option. If the Option is empty, it throws an error (`NoSuchElementException`).

**Example:**
```typescript
const option = Option.of(10);
const value = await option.get(); // value is 10
```

#### `getOrElse<U>(value: U | (() => Promise<U> | U)): Promise<T | U>`
Retrieves the contained value or returns a fallback value if the Option is empty.

**Example:**
```typescript
const option = Option.of(null);
const value = await option.getOrElse(5); // value is 5
```

#### `getOrElseThrow(exceptionProvider: () => Promise<Error> | Error): Promise<T>`
Retrieves the contained value or throws an error if the Option is empty.

**Example:**
```typescript
const option = Option.of(null);
await option.getOrElseThrow(() => new Error("Value not found"));
```

### Other Functions

#### `map<U>(mapper: (value: T) => Promise<U> | U): Option<U | Nullable>`
Transforms the value contained within this Option using the provided mapper function.

**Example:**
```typescript
const option = Option.of(10);
const doubled = option.map(v => v * 2); // Option<number> containing 20
```

#### `flatMap<U>(mapper: (value: T) => Promise<Option<U | Nullable>> | Option<U | Nullable>): Option<U | Nullable>`
Transforms the value contained within this Option using the provided mapper function and flattens the result.

**Example:**
```typescript
const option = Option.of(10);
const doubled = option.flatMap(v => Option.of(v * 2)); // Option<number> containing 20
```

#### `filter(predicate: (value: T) => Promise<boolean> | boolean): Option<T | Nullable>`
Filters the contained value based on the provided predicate. If the predicate returns false, the Option becomes empty.

**Example:**
```typescript
const option = Option.of(10);
const filtered = option.filter(v => v > 5); // Option<number> containing 10
```

#### `fold<U>(ifNone: () => Promise<U> | U, mapper: (value: T) => Promise<U> | U): Promise<U>`
Folds the Option into a single value. If the Option is empty, it calls the `ifNone` function. If the Option contains a value, it applies the `mapper` function.

**Example:**
```typescript
const option = Option.of(null);
const result = await option.fold(() => 5, v => v * 2); // result is 5
```

#### `transform<U>(transformer: (opt: this) => Promise<U> | U): Promise<U>`
Transforms this Option using the provided transformer function.

**Example:**
```typescript
const option = Option.of(10);
const result = await option.transform(opt => opt.isDefined() ? opt.get() : 5); // result is 10
```

#### `isEmpty(): boolean`
Checks whether this Option is empty.

**Example:**
```typescript
const option = Option.of(null);
const isEmpty = option.isEmpty(); // isEmpty is true
```

#### `isDefined(): boolean`
Checks whether this Option contains a value.

**Example:**
```typescript
const option = Option.of(10);
const isDefined = option.isDefined(); // isDefined is true
```

#### `onEmpty(func: () => any): Option<T>`
Executes a side effect if this Option is empty.

**Example:**
```typescript
const option = Option.of(null);
const result = option
    .onEmpty(() => console.log("Value is empty"))
    .run(); // Logs "Value is empty"
```

#### `peek(consumer: (value: Exclude<T, Nullable>) => Promise<unknown> | unknown): Option<T>`
Performs a side effect on the contained value if this Option is non-empty.

**Example:**
```typescript
const option = Option.of(10);
const result = option
    .peek(v => console.log(v)) // Logs 10
    .run(); 
```

### Example Usage

```typescript
// Example 1: Basic Option usage
const option = Option.of(10);
const value = await option.get(); // value is 10

// Example 2: Handling empty values
const emptyOption = Option.of(null);
const defaultValue = await emptyOption.getOrElse(5); // defaultValue is 5

// Example 3: Chaining operations
const result = Option.of(10)
  .map(v => v * 2)
  .filter(v => v > 5)
  .getOrElse(0);

console.log(await result); // Output: 20
```

## Why Use This Library?

- **Async Support**: All methods are designed to work with async functions and Promises, making it easy to handle asynchronous computations.
- **Functional Programming**: Provides functional constructs inspired by functional programming languages, but tailored for JavaScript/TypeScript developers.
- **Error Handling**: Handles errors in a functional way, without using try-catch blocks.
- **Optional Values**: Avoids `null` and `undefined` issues by using the `Option` type.
- **Chaining**: Methods can be chained together to create complex computations, with each method adding a step to the computation chain.

## Conclusion

This library is a powerful tool for handling computations that may result in success or failure, and working with optional values in an asynchronous context. With its async support, functional programming constructs, and error handling capabilities, it provides a modern and type-safe way to handle computations in JavaScript/TypeScript.