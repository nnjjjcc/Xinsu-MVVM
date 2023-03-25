/* 
专门负责解析模板内容
*/
class Compile {
    // 参数1：模板
    //参数2：vue实例
    constructor(el, vm) {
        //el：new vue传递的选择器
        //判断一下
        this.el = typeof el === "string" ? document.querySelector(el) : el
        //vm：new 的vue实例
        this.vm = vm
        //编译模板
        if (this.el) {
            //1.把el中所有的子结点都放入内存中，fragment
            let fragment = this.node2fragment(this.el)
            //2.在内存中编译fragment
            this.compile(fragment)
            //3.把fragment一次性加入页面
            this.el.appendChild(fragment)
        }
    }
    /*核心方法 */
    node2fragment(node) {
        let fragment = document.createDocumentFragment()
        //把el中所有的子节点挨个添加到文档碎片中
        let childNodes = node.childNodes
        this.toArray(childNodes).forEach(node => {
            //方法可向节点的子节点列表的末尾添加新的子节点
            fragment.appendChild(node)
        });
        return fragment
    }
    /**
     * 编译文档碎片（内存中）
     * @param {*} fragment 
     */
    compile(fragment) {
        let childNodes = fragment.childNodes
        this.toArray(childNodes).forEach(node => {
            //编译子节点
            if (this.isElementNode(node)) {
                // 如果是元素，需要解析指令
                this.compileElement(node)
            }
            if (this.isTextNode(node)) {
                // 如果是文本节点，需要解析插值表达式
                this.compileText(node)
            }
            // 如果当前节点还有子节点 ，需要递归的解析
            if (node.childNodes && node.childNodes.length > 0) {
                this.compile(node)
            }
        })
    }

    // 解析html标签
    compileElement(node) {
        // 1. 获取到当前节点下的所有的属性
        let attributes = node.attributes
        this.toArray(attributes).forEach(attr => {
            // 2. 解析Vue的指令 （所有以V-开头的属性）
            let attrName = attr.name

            if (this.isDirective(attrName)) {
                let type = attrName.slice(2)
                let expr = attr.value

                if (this.isEventDirective(type)) {
                    CompileUtil["eventHandler"](node, this.vm, type, expr)

                } else {
                    //当有这个方法的时候再调用就不会报错了

                    CompileUtil[type] && CompileUtil[type](node, this.vm, expr)
                }
            }
        })


    }
    // 文本节点
    compileText(node) {
        CompileUtil.mustache(node, this.vm)
    }
    /*工具方法*/
    //类数组（NodeList,arguments）变成数组
    toArray(linkArray) {
        return [].slice.call(linkArray)
    }
    isElementNode(node) {
        //nodeType :节点类型 1：元素节点 3：文本节点
        return node.nodeType === 1
    }
    isTextNode(node) {
        return node.nodeType === 3
    }
    isDirective(attrName) {
        //命名以什么开头
        return attrName.startsWith('v-')
    }
    isEventDirective(type) {
        return type.split(":")[0] === "on"
    }
}

let CompileUtil = {
    // 复杂类型插值语法
    mustache(node, vm) {
        let txt = node.textContent
        let reg = /\{\{(.+)\}\}/
        if (reg.test(txt)) {
            let expr = RegExp.$1
            node.textContent = txt.replace(reg, CompileUtil.getVMValue(vm, expr))
            effect(() => {
                node.textContent = txt.replace(reg, CompileUtil.getVMValue(vm, expr))
            })
        }


    },
    //处理 v-text指令 (自定义构造函数)
    text(node, vm, expr) {
        node.textContent = this.getVMValue(vm, expr)
        effect(() => {
            node.textContent = this.getVMValue(vm, expr)
        })
    },
    html(node, vm, expr) {
        node.innerHTML = this.getVMValue(vm, expr)
        effect(() => {
            node.innerHTML = this.getVMValue(vm, expr)
        })
    },
    model(node, vm, expr) {
        let self = this
        node.value = this.getVMValue(vm, expr)
        // 实现双向的数据绑定，给NODE注册INPUT事件，当前元素的value发生改变，便修改node数据
        node.addEventListener("input", MyDebounce(function () {
            self.setVMValue(vm, expr, this.value)
        }))
        effect(() => {
            node.value = this.getVMValue(vm, expr)
        })

    },
    eventHandler(node, vm, type, expr) {
        let eventType = type.split(":")[1]
        let fn = vm.$methods && vm.$methods[expr]

        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm))
        }
    },
    // 这个方法用于获取VM中的数据
    getVMValue(vm, expr) {
        // 获取data中的数据
        let data = vm.$data
        expr.split('.').forEach(item => {
            data = data[item]
        })
        return data
    },
    setVMValue(vm, expr, value) {
        let data = vm.$data
        let arr = expr.split(".")
        console.log(arr, "-----")
        // car brand
        arr.forEach((key, index) => {
            // 如果index是最后一个
            if (index < arr.length - 1) {
                console.log(key, "-----")
                data = data[key]
            }
            else {
                data[key] = value
            }

        })

    }

}