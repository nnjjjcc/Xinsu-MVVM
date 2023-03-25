/*  定义一个类，用于创建VUE实例*/

class Vue {
    //构造器

    constructor(options = {}) {
        //给vue实例增加属性
        this.$el = options.el
        this.$data = reactive(options.data)
        this.$methods = options.methods
        // 监视data中的数据
        // new Observer(this.$data)

        // 把data中所有的数据代理到vm上
        this.proxy(this.$data)
        // 把methods 中所有的数据代理到vm上
        this.proxy(this.$methods)

        //通过 Vue 实例属性 vm.$el 即可获取到 Vue 实例挂载到的 dom元素，返回的是一个 dom 对象，如 div，拿到 dom 元素后我们可以为它设置样式之类的。
        //vm.$el是使用另一种方式来挂载dom元素,vm.$data是获取data中的对象，使用vm.$data.xxx来获取
        //如果指定了el参数，对el进行解析
        if (this.$el) {
            //compile负责解析模板内容
            //需要：模板和数据
            let c = new Compile(this.$el, this)

        }

        // 内容拦截用户对代理对象的访问，从而在值发生变化的时候做出响应
        // function reactive(obj) {
        //     // 返回代理的对象
        //     return new Proxy(obj, {
        //         get(target, key) {
        //             console.log('get key:', key)
        //             return Reflect.get(target, key)
        //         },
        //         set(target, key, val) {
        //             console.log('set key:', key)
        //             const result = Reflect.set(target, key, val)
        //             // 通知更新
        //             app.update()
        //             return result
        //         }
        //     })
        // }

    }

    proxy(data) {
        Object.keys(data).forEach(key => {
            Object.defineProperty(this, key, {
                enumerable: true,
                configurable: true,
                get() {
                    return data[key]
                },
                set(newValue) {
                    if (data[key] == newValue) {
                        return
                    }
                    data[key] = newValue
                }
            })
        })
    }
}
