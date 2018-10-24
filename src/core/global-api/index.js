import config from '../config'
import { ASSET_TYPES } from 'shared/constants'

import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set } from '../observer/index'

export function initGlobalAPI(Vue) {
    const configDef = {};
    configDef.get = ()=> config;
    // configDef.set = ()=> {} 只读属性

    Object.defineProperty(Vue, 'config', configDef)

    Vue.set = set;

    Vue.options = Object.create(null);
    ASSET_TYPES.forEach(type => {
        Vue.options[type + 's'] = Object.create(null)
    });
    Vue.options._base = Vue;

    initExtend(Vue);

    // Vue添加三个静态方法 component directive filter
    initAssetRegisters(Vue);
}