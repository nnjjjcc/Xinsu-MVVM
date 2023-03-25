class Observer {
    constructor(data) {
        this.data = data
        this.walk(data)
    }

    /*核心方法 */
    /*遍历data中的所有数据，都添加getter  setter*/
    walk(data) {
        if (!data || typeof data != "object") {
            return

        }

        Object.keys(data).forEach(key => {
            //给data对象的key 设置 getter setter

            // console.log(data)
            this.defineReactive(data, key, data[key])


        })
    }
    // 定义响应式的数据 （数据劫持）
    defineReactive(obj, key, value) {
        // let that = this
        // Object.defineProperty(obj, key, {
        //     enumerable: true,
        //     configurable: true,
        //     get() {
        //         console.log("你获取了值", value)
        //         return value
        //     },
        //     set(newvalue) {
        //         if (value === newvalue) {
        //             return
        //         }
        //         console.log("你设置了值", newvalue)
        //         value = newvalue
        //         that.walk(newvalue)
        //     }
        // })
        function reactive(obj) {
            const handler = {
                get(target, prop, receiver) {
                    track(target, prop);
                    const value = Reflect.get(...arguments);
                    if (typeof value === 'Object') {
                        reactive(value)
                    } else {
                        return value
                    }
                },
                set(target, key, value, receiver) {
                    trigger(target, key, value);
                    return Reflect.set(...arguments);
                },
            };
            return new Proxy(obj, handler)
        }
        function track(data, key) {
            console.log("sue set", data, key);
        }
        function trigger(data, key, value) {
            console.log("sue set", key, ':', value);
        }
        reactive(obj)

    }
    // 定义一个Proxy处理器对象
    reactiveHandler = {
        get(target, prop) {
            console.log('进行的数据读取操作', prop)
            const result = Reflect.get(target, prop)
            return result
        },
        set(target, prop, value) {
            console.log('进行了修改数据的操作', prop, value)
            const result = Reflect.set(target, prop, value)
            return result
        },
        deleteProperty(target, prop) {
            console.log('进行了数据删除操作', prop)
            const result = Reflect.deleteProperty(target, prop)
            return result

        }

    }
    //定义一个浅度监听的函数 shallowReactive
    shallowReactive(target) {
        // 如果传入的target 存在 且是一个对象是执行
        if (target && typeof target === 'object') {
            return new Proxy(target, this.reactiveHandler)
        }
        return target

    }
    // reactive(data) {
    //     if (typeof target === 'Array') {
    //         target.forEach((item, index) => {
    //             // 遍历每项 并递归
    //             target[index] = reactive(item)
    //         })
    //     } else {
    //         // 遍历对象 并对对象的每个属性属性值进行递归遍历
    //         Object.keys(target).forEach((key) => {
    //             target[key] = reactive(target[key])
    //         })
    //     }
    //     // 如果传入的target 存在 且是一个对象是执行
    //     if (target && typeof target === 'object') {
    //         return new Proxy(target, reactiveHandler)
    //     }
    //     // 否则
    //     return target

    // }
    reactive(raw) {
        // 劫持的对象 对代理对象的数据劫持
        return new Proxy(raw, {
            // 获取数据时调用
            // target 参数 就是 我们劫持的对象 raw
            get(target, key) {
                const dep = getDep(target, key);
                dep.depend();
                // 这里没有考虑属性值还是对象的情况
                return target[key];
            },
            // 设置数据时调用
            set(target, key, newValue) {
                const dep = getDep(target, key);
                target[key] = newValue;
                dep.notify();
            }
        });
    }


}