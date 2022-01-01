import { LogicConfig } from "../common/config";
import { TradeManager } from "./Core/TradeManager";
import { ArbitrageLogic } from "./Logics/ArbitrageLogic";

TradeManager.MainProcess();

/*
class Animal {
    constructor() {

    }

    hello() {
        console.log("Animal");
    }
}

class Dog extends Animal {
    constructor() {
        super();
    }

    hello() {
        console.log("Dog");
        super.hello();
    }
}

class Cat extends Animal {
    constructor() {
        super();
    }

    hello() {
        console.log("Cat");
        super.hello();
    }
}

let animals: Array<Animal> = [];
animals.push(new Dog());
animals.push(new Cat());

animals.forEach(animal => {
    animal.hello();
});
*/