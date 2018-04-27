import { initMixin } from "./init";
import { stateMixin } from './state'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { renderMixin } from './render'

function Vue(options) {
    if(!(this instanceof Vue)) {
        console.error('Vue is a constructor and should be called with the `new` keyword');
    }
    this._init(options);
}
initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);

export default Vue