import Vue from 'vue'



export default function init(el) {
    const vm = new Vue({
        el: el,
        data: {
            a: {b:1},
            arr: [1, 2]
        },
        template: '<div><span>{{a.b}}</span><p>{{a.c}}</p></div>',
        /*computed: {
            b: function () {
                const res = this.a + 2;
                return res
            }
        }*/
    })
    
    // console.log('vm.b: ', vm.b)
    
    
    setTimeout(()=> {
        // vm.a.b = 6;
        // console.log('computed b: ', vm.b);
        // Vue.set(vm.a, 'c', 9);
    }, 2000)
}