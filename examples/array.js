import Vue from 'vue'

export default function init(el) {
    const vm = new Vue({
        el: el,
        data: {
            b: ['a', 'b', 'v']
        },
        template: '<div><span v-for="value in b">{{value}}</span></div>'
    })

    setTimeout(()=> {
        // vm.b.splice(0, 1, 'z')
        // vm.b.push(1)
        // vm.b.unshift(1);
        // vm.b.pop();
        // vm.b.shift()

        // vm.list[0].val = 3
        // vm.list[0] = {val: 4}

        // vm.obj.c = 7

        vm.b[0] = '1'
    }, 1000)

}


//除了observe属性list外,还对list中的每个元素observe