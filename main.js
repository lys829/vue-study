import Vue from './src/platforms/web/entry-runtime-with-compiler'

const appNode = document.getElementById('app');

const vm = new Vue({
    el: appNode,
    data: {
        a: 1
    },
    template: '<div>{{a}}</div>',
    computed: {
        b: function () {
            const res = this.a + 2;
            return res
        }
    }
})

