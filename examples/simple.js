import Vue from 'vue'



export default function init(el) {
    const vm = new Vue({
        el: el,
        data: {
            a: 1
        },
        template: '<div><span>{{a}}</span><p>{{b}}</p></div>',
        computed: {
            b: function () {
                const res = this.a + 2;
                return res
            }
        }
    })
    
    // console.log('vm.b: ', vm.b)
    
    
    setTimeout(()=> {
        vm.a = 6
        console.log('computed b: ', vm.b);
    }, 2000)
}