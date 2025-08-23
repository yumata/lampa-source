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

    use(Module) {
        let instance = typeof Module === 'function' ? new Module(this) : Module

        if (this.components.includes(instance)) return

        this.components.push(instance);
    }

    unuse(Module) {
        // Удаляет по ссылке, если передан объект
        this.components = this.components.filter(c => c !== Module)
    }

    has(Module) {
        // Проверка по ссылке
        return this.components.some(c => c === Module || (typeof Module === 'function' && c instanceof Module))
    }

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