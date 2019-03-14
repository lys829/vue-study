import Vue from 'vue'

export default function init(el) {
    const vm = new Vue({
        el: el,
        data: {
            a: {b:1},
            name: '12'
        },
        template: '<div><span>{{a.b}}</span><p>{{name}}</p></div>',
        created () {
            // this.$nextTick(() => { console.log(1) });
            // this.$nextTick(() => { console.log(2) });
            // this.$nextTick(() => { console.log(3) })

            this.name = 'zx'
            this.$nextTick(() => {
                this.name = 'hcy'; //这里也触发了$nextTick
                this.$nextTick(() => { console.log('第二个 $nextTick') })
            })
        }
    })

}