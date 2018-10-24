import Vue from 'vue'

export default function init(el) {
    const vm = new Vue({
        el: el,
        data: {
            a: 1,
            name: 'z'
        },
        template: '<div>{{name}}</div>',
        beforeCreate() {
            console.log('%c lifecycle before created', "color: green;");
        },
        created() {
            this.name = 'HcySunYang'
            this.$nextTick(() => {
                this.name = 'hcy'
                this.$nextTick(() => { console.log('第二个 $nextTick') })
            })
        }
    })
}