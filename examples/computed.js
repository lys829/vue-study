import Vue from 'vue'

export default function init(el) {
    const vm = new Vue({
        el: el,
        data: {
            a: 1,
        },
        template: '<div>b: {{b}}</div>',
        computed: {
            b: {
                get: function () {
                    return this.a + 2
                }
            }
        }
    });

    setTimeout(()=> {
        vm.a = 4;
    }, 1000)
}

// 1.initComputed 中执行new Watcher()
//      因为lazy为true，所以不处罚this.get()
// 2.render函数中执行new Watcher(), 命名render_watcher
//      computedGetter(state.js)触发
//      执行b_watcher的evaluate, 此时会让属性a收集关于b的watcher(b_watcher), 同时b_watcher会收集a的dep
//      执行watcher.depend(), 会让b_watcher中的dep(即属性a的dep)收集render_watcher