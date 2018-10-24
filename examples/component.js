import Vue from 'vue'

export default function init(el) {
    Vue.component('button-counter', {
        props: ['test'],
        data: function () {
            return {
                count: 0
            }
        },
        template: '<button v-on:click="count++">You clicked me {{ count }} times {{test}}.</button>'
    });

    const vm = new Vue({
        el: el,
        data: {
            a: 1
        },
        template: '<div><button-counter :test="a"></button-counter></div>'
    });

    setTimeout(()=> {
        console.log('%c timeout', 'color:orange;')
        vm.a = 5
    }, 2000)
}