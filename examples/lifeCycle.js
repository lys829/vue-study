import Vue from 'vue'

export default function init(el) {
    const vm = new Vue({
        el: el,
        data: {
            a: 1
        },
        template: '<div>{{a}}</div>',
        beforeCreate() {
            console.log('%c lifecycle before created', "color: green;");
        }
    })
}