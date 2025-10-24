import Emit from '../utils/emit'
import Arrays from '../utils/arrays'
import MaskHelper from '../utils/mask'

/**
 * Конструктор модуля
 * @param {*} Map - карта модулей
 * @returns {Class} - класс модуля
 */
function Constructor(Map = {}) {
    const Helper = new MaskHelper(Arrays.getKeys(Map))

    return class Contrucor extends Emit {
        constructor(data) {
            super(data)

            Arrays.extend(data, {params: {}})

            this.data   = data
            this.params = data.params

            let module = typeof this.params.module !== 'undefined' ? this.params.module : Helper.MASK.none
    
            Helper.getNames(module).map(name => Map[name]).forEach(mod => this.use(mod))
    
            this.emit('init')
        }

        toggle(){
            this.emit('toggle')
        }

        create() {
            this.html = document.createElement('div')

            this.emit('create')
        }

        render(js) {
            return js ? this.html : $(this.html)
        }

        destroy() {
            this.html.remove()

            this.emit('destroy')
        }
    }
}

export default Constructor