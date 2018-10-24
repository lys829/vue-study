import Vue from 'vue'

export default function init(el) {
    const vm = new Vue({
        el: el,
        data: {
            a: 1,
            o: {
                n: 'n'
            }
        },
        template: '<div><span>a: {{a}}</span><p>computed b: {{b}}</p><i>{{o.n}}</i></div>',
        computed: {
            b: function () {
                const res = this.a + 2;
                return res
            }
        },
        watch: {
            a: function(val, oldVal) {
                console.log(`用户自定义watcher监听到改变 旧值:${oldVal} 新值: ${val}`);
            }
        }
    })
    
    setTimeout(()=> {
        // vm.a = 6
        vm.o = {n : 'test'}
        console.log('computed b: ', vm.b);
    }, 2000)
}


/**
 * 属性a的dep包含三个监听器, render的watcher, 计算属性b的watcher, 用户自定义的属性a的watcher
 * 属性b的dep包含render的watcher
 */