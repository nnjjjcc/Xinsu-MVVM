function reactive(target) {
    return new Proxy(target, {
        get(target, key, receiver) {
            // 订阅
            track(target, key);
            return Reflect.get(target, key, receiver);
        },
        set(target, key, value, receiver) {
            const result = Reflect.set(target, key, value, receiver);
            // 发布
            trigger(target, key);
            return result;
        }
    })
}
let targetMap = new WeakMap();

function track(target) {
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        targetMap.set(target, depsMap = new Map())
    }
    let deps = depsMap.get(key)
    if (!deps) {
        depsMap.set(target, deps = new Set())
    }

}
function effect(fn) {
    let effect = run(fun);
    effect()
    return effect
}
let activeReactiveEffectStack = []
function run(effect, fn) {
    try {
        activeReactiveEffectStack.push(effect)
        fn(...args)
        activeEffect = fn
    }
    finally {


    }
}