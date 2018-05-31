
import Vue from 'vue'

export default function init(el) {
    // const vm = new Vue({
    //     el: el,
    //     data: {
    //         counter: 0,
    //         visible: false
    //     },
    //     template: `<div @click="handle">{{counter}}</div>`,
    //     methods: {
    //         handle() {
    //             console.log('click callback')
    //             this.counter += 1
    //         }
    //     }
    // })


    const vm = new Vue({
        el: el,
        data: {
            expand: true
        },
        template: `<header>
            <div class="A" v-if="expand"><i @click="test1">Expand is True</i></div>
            <div class="B" v-if="!expand" @click="test2"><i>Expand is False</i></div>
        </header>`,
        methods: {
            test1() {
                this.expand = false;
            },
            test2() {
                this.expand = true;
            }
        }
    })
}

