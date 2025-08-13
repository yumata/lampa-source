import Base from './base'
import ModuleMask from './module/module'
import ModuleMap from './module/map'

class Episode extends Base {
    constructor(data) {
        super(data)

        let module = this.params.module || ModuleMask.MASK.base

        ModuleMask.getNames(module).map(name => ModuleMap[name]).forEach(mod => this.use(mod))

        this.emit('init')
    }
}

export default Episode