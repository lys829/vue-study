import Vue from 'vue'



export default function init(el) {
    const vm = new Vue({
        el: el,
        data: {
            a: 'a'
        },
        template: '</p>',
        /*computed: {
            b: function () {
                const res = this.a + 2;
                return res
            }
        }*/
    })

    // console.log('vm.b: ', vm.b)


    setTimeout(()=> {

    }, 2000)
}