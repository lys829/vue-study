import { ASSET_TYPES } from 'shared/constants'
import { extend, mergeOptions } from '../util/index'
import {proxy} from "core/instance/state";

export function initExtend(Vue) {
    Vue.cid = 0;
    let cid = 1;

    /**
     * Class inheritance
     */
    Vue.extend = function (extendOptions) {
        extendOptions = extendOptions || {};
        const Super = this;
        const SuperId = Super.cid;
        const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
        if(cachedCtors[SuperId]) {
            return cachedCtors[SuperId];
        }
        const name = extendOptions.name || Super.options.name;
        const Sub = function VueComponent(options) {
            console.log('Sub init')
            this._init(options);
        };

        Sub.prototype = Object.create(Super.prototype);
        Sub.prototype.constructor = Sub;
        Sub.cid = cid++;
        // mergeOptions 对于components选项, 相当于extend(Super.options, extendOptions)
        Sub.options = mergeOptions(
            Super.options,
            extendOptions
        );
        Sub['super'] = Super;

        // 避免实例中通过 Object.defineProperty 重新代理访问
        if(Sub.options.props) {
            initProps(Sub);
        }

        //TODO: computed ...

        // create asset registers, so extended classes
        // can have their private assets too.
        ASSET_TYPES.forEach(function (type) {
            Sub[type] = Super[type]
        });

        // enable recursive self-lookup
        if(name) {
            Sub.options.components[name] = Sub;
        }

        // keep a reference to the super options at extension time.
        // later at instantiation we can check if Super's options have been updated
        Sub.superOptions = Super.options;
        Sub.extendOptions = extendOptions;
        Sub.sealedOptions = extend({}, Sub.options);

        //cache constructor
        cachedCtors[SuperId] = Sub;
        return Sub;
    }
}

function initProps(Comp) {
    const props = Comp.options.props;
    for( const key in props) {
        proxy(Comp.prototype, '_props', key)
    }
}