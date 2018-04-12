import Vue from './src/platforms/web/entry-runtime-with-compiler'

for(let attr in Vue ) {
    console.log(attr)
}

const vm = new Vue()