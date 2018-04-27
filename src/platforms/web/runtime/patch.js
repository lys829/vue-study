
import * as nodeOps from './node-ops'
import { createPatchFunction } from 'core/vdom/patch'

export const patch = createPatchFunction({nodeOps});