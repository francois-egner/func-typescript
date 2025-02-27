import {Option, Try} from "../"


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

    describe("Option.peek", () => {
        test("Option.peek with no value", async () => {
            var v = 3;
            const option = Option.of(null).peek((_)=> {v = 4});
            await option.run();
            expect(v).toBe(3);
        })

        test("Option.peek with value", async () => {
            var v = 3;
            const option = Option.of(23).peek((value)=> {v = value});
            await option.run();
            expect(v).toBe(23);
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

    describe("Option.filter", () => {
        test("Option.filter with no value", async () => {
            const option = Option.of(null).filter((value)=> value == "test");
            await expect(option.get()).rejects.toThrow("No value present");
        })

        test("Option.filter with non matching value", async () => {
            const option = Option.of(123).filter((value)=> value == 123);
            await expect(option.get()).rejects.toThrow("No value present");
        })

        test("Option.filter with matching value", async () => {
            const option = Option.of(123).filter((value)=> value == 125);
            await expect(option.get()).resolves.toBe(123);
        })
    })

    describe("Option.map", () => {
        test("Option.map with no value", async () => {
            const option = Option.of(null).map((_) => "test");
            await expect(option.get()).rejects.toThrow("No value present");
        })

        test("Option.map with value", async () => {
            const option = Option.of(123).map((value) => value + "test");
            await expect(option.get()).resolves.toBe("123test");
        })
    })

    describe("Option.mapTry", () => {
        test("Option.mapTry with no value", async () => {
            const t = Option.of(null).mapTry((_) => "test");
            await expect(t.get()).rejects.toThrow("No value present");
        })

        test("Option.map with value", async () => {
            const t = Option.of(123).mapTry((value) => value + "test");
            expect(t).toBeInstanceOf(Try);
            await expect(t.get()).resolves.toBe("123test");
        })
    })



    describe("Option.flatMap", () => {
        test("Option.flatMap with no value", async () => {
            const option = Option.of(null).flatMap((_) => Option.of("test"));
            await expect(option.get()).rejects.toThrow("No value present");
        })

        test("Option.flatMap with value", async () => {
            const option = Option.of(123).flatMap((value) => Option.of(value + "test"));
            await expect(option.get()).resolves.toBe("123test");
        })
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

    describe("Option.fold", () => {
        test("Option.fold with provided value", async () => {
            const option = Option.of(null);
            await expect(option.fold(()=> "test", (v)=> v)).resolves.toBe("test");
        })

        test("Option.fold with provided provider", async () => {
            const option = Option.of(123);
            await expect(option.fold(()=> "test", (v)=> "test" + v)).resolves.toBe("test123");
        })
    })

    describe("Option.transform", () => {
        test("Option.transform with provided value", async () => {
            const option = Option.of(null);
            await expect(option.transform(async (opt)=> {
                await opt.run()
                if (opt.isEmpty()) return "empty"
            })).resolves.toBe("empty");
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