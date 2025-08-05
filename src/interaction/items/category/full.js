import Base from './base'
import ModuleMask from './module/module'
import ModuleMap from './module/map'

class Full extends Base {
    constructor(object) {
        super(object)

        let module = typeof this.params.module !== 'undefined' ? this.params.module : ModuleMask.MASK.base

        ModuleMask.getNames(module).map(name => ModuleMap[name]).forEach(mod => this.use(mod))

        this.emit('init')
    }
}

export default Full