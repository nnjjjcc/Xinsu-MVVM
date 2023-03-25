//  定义一个reactiveHandler处理对象
const reactiveHandler = {

    // 获取属性值
    get(target, prop) {

        this.Dep.target && this.dep.addSub(Dep.target)
        console.log(dep)
        const result = Reflect.get(target, prop);
        console.log('拦截了读取数据', prop, result);
        return result
    },
    // 修改属性值/添加属性
    set(target, prop, value) {

        const result = Reflect.set(target, prop, value);
        console.log('拦截了修改属性值或者是添加属性', prop, value);
        // window.Watcher.update()
        //发布通知，让所有的订阅者更新
        dep.notify()

    },
    deleteProperty(target, prop) {
        const result = Reflect.deleteProperty(target, prop);
        console.log('拦截了删除数据', prop);
        return result
    }
}
function reactive(target) {

    // 判断当前的目标对象是否是object类型(对象/数组)
    if (target && typeof target === 'object') {
        // 对数组或者对象中所有的数据进行reactive的递归处理
        // 判断当前的数据是否是数组
        if (Array.isArray(target)) {
            // 数组的数据进行遍历操作
            target.forEach((item, index) => {
                target[index] = reactive(item)
            })
        } else {
            // 判断当前的数据是否是对象
            // 对象的数据也要进行遍历的操作
            Object.keys(target).forEach((key) => {
                target[key] = reactive(target[key])
            })
        }
        return new Proxy(target, reactiveHandler)
    }
    // 如果传入的目标对象是基本类型的数据，则直接返回
    return target
}
let dep = new Dep()