import Vue from 'vue'

export default function init(el) {
    const vm = new Vue({
        el: el,
        data: {
            a: {b:1},
            arr: [1, 2]
        },
        template: '<div><span>{{a.b}}</span><p>{{a.c}}</p></div>',
    });

    setTimeout(()=> {

    }, 2000)
}