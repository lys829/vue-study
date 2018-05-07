import Vue from 'vue'

export default function init(el) {
    const vm = new Vue({
        el: el,
        data: {
            a: 1,
            c: 2
        },
        template: '<div><span>{{a}}</span><p>{{b}}</p><i>{{c}}</i></div>',
        computed: {
            b: function () {
                const res = this.a + 2;
                return res
            }
        },
        watch: {
            a: function(val) {
                console.log('用户自定义watcher监听到改变', val);
            }
        }
    })
    
    setTimeout(()=> {
        vm.c = 1;
        vm.c = 4;
        vm.c = 6;
    }, 2000)
}