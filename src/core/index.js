import Vue from './instance/index'
import { initGlobalAPI } from './global-api/index'

initGlobalAPI(Vue);

// TODO: $isServer $ssrContext FunctionalRenderContext的定义

Vue.version = '1.0.0'

export default Vue;