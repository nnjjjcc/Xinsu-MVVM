/*
watcher模块负责把compile模块和observe模块关联起来
 */
class Watcher {
    // vm: 当前的vue实例
    // expr: data中的数据的名字
    //一旦数据发生了改变，需要调用 cb
    constructor(vm, expr, cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb
        // this 表示的就是新创建的watcher对象
        //储存到Dep.target上
        Dep.target = this
        // 需要把expr的旧值给存储起来
        this.oldValue = this.getVMValue(vm, expr)
        Dep.target = null

    }
    //对外暴露的一个方法，这个方法用于更新数据
    update() {
        // 对比expr是否发生了改变，如果发生了改变，需要调用cb
        let oldValue = this.oldValue
        let newValue = this.getVMValue(this.vm, this.expr)
        if (oldValue != newValue) {
            this.cb(newValue, oldValue)
        }

    }
    // 这个方法用于获取VM中的数据
    getVMValue(vm, expr) {
        // 获取data中的数据
        let data = vm.$data
        expr.split('.').forEach(item => {
            data = data[item]
        })
        return data
    }

}
//data中的每一个数据都应该维护一个dep对象
//dep 保存了所有订阅了该数据的订阅者
// class Dep {
//     constructor() {
//         //用于管理订阅者
//         this.subs = []
//         console.log(this.subs)
//     }
//     // 添加订阅者
//     addSub(Watcher) {
//         this.subs.push(Watcher)
//     }
//     // 通知
//     notify() {
//         //遍历所有的订阅者，调用watcher的update方法
//         this.subs.forEach(sub => {
//             sub.update()
//         })
//     }
// }
