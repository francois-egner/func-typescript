import { Option } from "../"


describe("Option", () => {

    describe("Option.of", ()=>{
        test("Option.of should consume a non empty value", async () => {
            const option = Option.of("test");
            await expect(option.get()).resolves.toBe("test");
        });

        test("Option.of should consume an empty value", async () => {
            const option = Option.of(null);
            await expect(option.get()).rejects.toThrow("No value present");
        });
    })

    describe("Option.get", ()=>{
        test("Option.of should return non empty value", async () => {
            const option = Option.of("test");
            await expect(option.get()).resolves.toBe("test");
        });

        test("Option.of should throw NoSuchElementException", async () => {
            const option = Option.of(null);
            await expect(option.get()).rejects.toThrow("No value present");
        });
    })

    describe("Option.run", () => {
        test("Option.run with no value", async () => {
            const option = Option.of(null)
            await option.run();
            expect(option.isEmpty()).toBe(true);
        })

        test("Option.run with value", async () => {
            const option = Option.of(123)
            await option.run();
            expect(option.isEmpty()).toBe(false);
        })
    })

    describe("Option.isEmpty", ()=> {
        test("Option.isEmpty should return false", async () => {
            const option = Option.of("test");
            await option.get()
            expect(option.isEmpty()).toBe(false);

        });

        test("Option.isEmpty should return true", async () => {
            const option = Option.of(null);
            try{await option.get()}catch(e){}
            expect(option.isEmpty()).toBe(true);

        });
    })

    describe("Option.when", () => {
        test("Option.when should create a non empty Option with provided value", async () => {
            const option = Option.when(true, 123);
            await expect(option.get()).resolves.toBe(123);
            expect(option.isEmpty()).toBe(false);

        });

        test("Option.when should create a non empty Option instance with the computed value", async () => {
            const option = Option.when(true, ()=> "test");
            await expect(option.get()).resolves.toBe("test");
            expect(option.isEmpty()).toBe(false);
        });
    });

    describe("Option.onEmpty", () => {
        test("Option.onEmpty should run function if Option is empty", async () => {
            var functionRan = false;
            const option = Option.when(false, 123).onEmpty(()=>{
                functionRan = true
            });
            try{await option.get()}catch(e){}

            expect(functionRan).toBe(true);

        });
    })

    describe("Option.getOrElse", () => {
        test("Option.getOrElse with provided value", async () => {
            const option = Option.of(null);
            await expect(option.getOrElse("test")).resolves.toBe("test");
        })

        test("Option.getOrElse with provided provider", async () => {
            const option = Option.of(null);
            await expect(option.getOrElse(async () => "test")).resolves.toBe("test");
        })
    })

    describe("Option.getOrElseThrow", () => {

        test("Option.getOrElseThrow should throw on empty Option", async () => {
            const option = Option.of(null);
            await expect(option.getOrElseThrow(()=> Error("Throwing"))).rejects.toThrow("Throwing");
        })

        test("Option.getOrElseThrow should not throw on non empty Option and return value", async () => {
            const option = Option.of(123);
            await expect(option.getOrElseThrow(()=> Error("Throwing"))).resolves.toBe(123);
        })
    })

    describe("Option.orElse", () => {
        test("Option.orElse with provided value", async () => {
            const option = Option.of(null).orElse(Option.of("test"));
            await expect(option.get()).resolves.toBe("test");
        })

        test("Option.orElse with provided provider", async () => {
            const option = Option.of(null).orElse(() => Option.of("test"));
            await expect(option.get()).resolves.toBe("test");
        })
    })
});