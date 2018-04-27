import { ASSET_TYPES } from 'shared/constants'

export function initGlobalAPI(Vue) {
    const configDef = {};
    configDef.get = ()=> {};
    // configDef.set = ()=> {} 只读属性

    Object.defineProperty(Vue, 'config', configDef)

    Vue.options = Object.create(null);
    ASSET_TYPES.forEach(type => {
        Vue.options[type + 's'] = Object.create(null)
    })

    Vue.options._base = Vue;
}