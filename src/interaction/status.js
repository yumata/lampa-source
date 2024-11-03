class Status{
    constructor(){
        this.time = Date.now()
        this.msgs = []

        this.container = $('<div style="left: 1em; bottom: 1em; position: fixed; z-index: 1000; font-weight: 200; line-height: 1.6; font-size: 0.9em; padding: 1em; background: rgba(0,0,0,0.2)"></div>')
    }

    start(){
        $('body').append(this.container)

        this.tic = setInterval(()=>{
            let msg = this.msgs.slice(0,2)

            this.container.empty()

            msg.forEach(m=>{
                this.container.append($('<div style="'+(m.critical ? 'color: red' : '')+'">['+m.time+'s] '+m.msg+'</div>'))
            })

            if(this.msgs.length > 5) this.msgs = this.msgs.slice(1,this.msgs.length)
        },200)
    }

    push(msg){
        this.msgs.push({time: ((Date.now() - this.time) / 1000).toFixed(1), msg})

        console.log('AppStatus', msg)
    }

    critical(msg){
        this.msgs.push({time: ((Date.now() - this.time) / 1000).toFixed(1), msg, critical: true})

        console.log('AppStatus', msg)
    }

    destroy(){
        clearInterval(this.tic)

        this.container.remove()
    }
}

export default new Status()