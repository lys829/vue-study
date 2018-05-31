
import Vue from 'vue'

export default function init(el) {
    const vm = new Vue({
        el: el,
        data: {
            list: [
                {show: true, id: 0},                
                {show: true, id: 1},
                // {show: true, id: 2},
                // {show: true, id: 3},
            ],
            style: {
                position: 'absolute',
                left: '100px',
                color: 'red'
            },
            class1: 'test'
        },
        template: `<div><p v-for="item in list" v-if="item.show" style="border:1px solid #ddd;" :style="style" class="staticClass" :class="class1">{{item.id}}</p></div>`
    })

    setTimeout(()=> {
        vm.list[0].show = false;
        // vm.list[2].show = false;
        // vm.style.color = 'green'
    }, 1000)
}


/**
 * v-for 为自带指令 web/runtime/patch.js => vdom/modules/index.js => core/vdom/modules/index
 */