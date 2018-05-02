import Vue from './src/platforms/web/entry-runtime-with-compiler'

const appNode = document.getElementById('app');

const vm = new Vue({
    el: appNode,
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
