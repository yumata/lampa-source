/**
 * События для компонентов
 * Компоненты - классы с методами onEvent и onlyEvent
 * onEvent - событие, которое вызывается у всех компонентов
 * onlyEvent - событие, которое вызывается только у одного компонента
 * Если несколько компонентов реализуют onlyEvent, то будет вызван только первый
 */
class Emit {
    constructor() {
        this.components = [];
    }

    /**
     * Добавляет компонент
     * @param {class|object} Module - класс или объект компонента
     * @param {number|null} position - позиция в массиве компонентов, по умолчанию в конец
     * @return {void}
     */
    use(Module, position = null) {
        let instance = typeof Module === 'function' ? new Module(this) : Module

        if (this.components.includes(instance)) return

        if (position === null) {
            this.components.push(instance)
        } 
        else {
            this.components.splice(position, 0, instance)
        }
    }

    /**
     * Удаляет компонент
     * @param {class|object} Module - класс или объект компонента
     * @return {void}
     */
    unuse(Module) {
        this.components = this.components.filter(c => c !== Module)
    }

    /**
     * Проверяет наличие компонента
     * @param {class|object} Module - класс или объект компонента
     * @return {boolean}
     */
    has(Module) {
        return this.components.some(c => c === Module || (typeof Module === 'function' && c instanceof Module))
    }

    /**
     * Вызывает событие у компонентов
     * @param {string} event - имя события
     * @param  {...any} args - аргументы события
     * @return {void}
     */
    emit(event, ...args) {
        let name = event.charAt(0).toUpperCase() + event.slice(1)
        let only = false

        this.components.forEach(c => {
            let handler = c[`only${name}`]

            if (typeof handler === 'function') {
                only = handler
            }
        })

        if (only) {
            return only.call(this, ...args)
        }

        this.components.forEach(c => {
            let handler = c[`on${name}`]

            if (typeof handler === 'function') {
                handler.call(this, ...args)
            }
        })
    }
}

export default Emit