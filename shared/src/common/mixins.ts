//Taken from https://www.typescriptlang.org/docs/handbook/mixins.html#mixin-sample

function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            const descriptor = Object.getOwnPropertyDescriptor(baseCtor.prototype, name)
            if (!descriptor) throw new Error(`Error getting descriptor for property '${name}'`)
            Object.defineProperty(derivedCtor.prototype, name, descriptor);
        });
    });
}