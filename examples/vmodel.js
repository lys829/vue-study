
import Vue from 'vue'

export default function init(el) {
    const vm = new Vue({
        el: el,
        data: {
            val: 0,
        },
        template: `<div><input type="text" v-model="val"><p>{{val}}</p></div>`,
    })
}

