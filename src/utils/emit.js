class Emit {
    constructor() {
        this.components = [];
    }

    use(Module) {
        const instance = typeof Module === 'function' ? new Module(this) : Module;

        if (this.components.includes(instance)) return;

        this.components.push(instance);
    }

    unuse(Module) {
        // Удаляет по ссылке, если передан объект
        this.components = this.components.filter(c => c !== Module);
    }

    has(Module) {
        // Проверка по ссылке
        return this.components.includes(Module);
    }

    emit(event, ...args) {
        const name = event.charAt(0).toUpperCase() + event.slice(1);

        this.components.forEach(c => {
            const handler = c[`on${name}`];
            if (typeof handler === 'function') {
                handler.call(this, ...args);
            }
        });
    }
}

export default Emit