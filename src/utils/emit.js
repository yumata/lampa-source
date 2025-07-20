class Emit{
    constructor(){
        this.components = []
    }

    use(Module){
        if (this.components.some(c => c instanceof Module)) return

        this.components.push(new Module(this))
    }

    unuse(Module){
        this.components = this.components.filter(c => !(c instanceof Module))
    }

    has(Module){
        return this.components.some(c => c instanceof Module)
    }

    emit(event, ...args){
        this.components.forEach(c=>{
            let name = event.charAt(0).toUpperCase() + event.slice(1)

            if (typeof c[`on${name}`] === 'function') {
                c[`on${name}`].call(this,...args)
            }
        })
    }
}

export default Emit