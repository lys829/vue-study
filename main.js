import Vue from './src/platforms/web/entry-runtime-with-compiler'

// import demo from './examples/simple.js'
// import demo from './examples/watcher'
// import demo from './examples/updateVm'
// import demo from './examples/array'
// import demo from './examples/lifeCycle'
// import demo from './examples/vdom'
// import demo from './examples/event'
// import demo from './examples/vmodel'
import demo from './examples/component'
// import demo from './examples/scheduler'
// import demo from './examples/computed'
// import demo from './examples/parser'
// import demo from './examples/props'

window.__WEEX__ = false;


const appNode = document.getElementById('app');
demo(appNode);



if(module.hot) {
    //热更新
    module.hot.accept();
}

