// 判断是否是一个对象
const isObject = val => val !== null && typeof val === 'object'
// 如果是对象则调用reactive
const convert = target => isObject(target) ? reactive(target) : target
// 判断对象是否存在key属性
const haOwnProperty = Object.prototype.hasOwnProperty
const hasOwn = (target, key) => haOwnProperty.call(target, key)

function reactive(target) {
    if (!isObject(target)) {
        // 如果不是对象直接返回
        return target
    }

    const handler = {
        get(target, key, receiver) {
            // 收集依赖
            track(target, key)
            const result = Reflect.get(target, key, receiver)
            console.log(result, "get")
            // 如果属性是对象则需要递归处理
            return convert(result)
        },
        set(target, key, value, receiver) {
            const oldValue = Reflect.get(target, key, receiver)
            let result = true;
            // 需要判断当前传入的新值和oldValue是否相等，如果不相等再去覆盖旧值，并且触发更新
            if (oldValue !== value) {
                result = Reflect.set(target, key, value, receiver)
                // 触发更新...
                trigger(target, key)
            }
            // set方法需要返回布尔值
            console.log(result, "set")
            return result;
        },
        deleteProperty(target, key) {
            // 首先要判断当前target中是否有自己的key属性
            // 如果存在key属性，并且删除要触发更新
            const hasKey = hasOwn(target, key)
            const result = Reflect.deleteProperty(target, key)
            if (hasKey && result) {
                // 触发更新...
                trigger(target, key)
            }
            return result;
        }
    }
    return new Proxy(target, handler)
}



let activeEffect = null;
function effect(callback) {
    activeEffect = callback;
    // 访问响应式对象属性，收集依赖
    callback();
    // 依赖收集结束要置null
    activeEffect = null;
}
// function effect(fn) {
//     const effectFn = () => {
//         cleanup(effectFn)
//         activeEffect = effectFn
//         effectStack.push(effectFn)
//         fn()
//         effectStack.pop()
//         activeEffect = effectStack[effectStack.length - 1]
//     }
// }


let targetMap = new WeakMap()
function track(target, key) {
    // 判断activeEffect是否存在
    if (!activeEffect) {
        return;
    }
    // depsMap存储对象和effect的对应关系
    let depsMap = targetMap.get(target)
    // 如果不存在则创建一个map存储到targetMap中
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()))
    }
    // 根据属性查找对应的dep对象
    let dep = depsMap.get(key)
    // dep是一个集合，用于存储属性所对应的effect函数
    if (!dep) {
        // 如果不存在，则创建一个新的集合添加到depsMap中
        depsMap.set(key, (dep = new Set()))
    }
    dep.add(activeEffect)
}
function trigger(target, key) {
    const depsMap = targetMap.get(target)
    // 如果没有找到直接返回
    if (!depsMap) {
        return;
    }
    const dep = depsMap.get(key)
    if (dep) {
        dep.forEach(effect => {
            effect()
        })
    }
}