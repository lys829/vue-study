import Vue from 'vue'

export default function init(el) {
    const vm = new Vue({
        el: el,
        data: {
            a: 1,
        },
        template: '<div><span>{{a}}</span></div>'
    })
    
    
}