export default{
    onInit: function(){
        this.next_wait

        this.builded_time = Date.now()
    },

    onBuild: function(){
        this.scroll.onEnd = this.emit.bind(this, 'loadNext')

        this.builded_time = Date.now()
    },

    onLoadNext: function(){
        if(!this.next_wait && this.items.length && this.builded_time < Date.now() - 1000){
            this.next_wait = true

            this.emit('next', (new_data)=>{
                this.next_wait = false

                if(!this.items.length || this.destroyed) return

                let split_total = Math.ceil(new_data.length / this.limit_view)

                // Разбиваем на части, чтобы не лагал браузер
                for(let i = 0; i < split_total; i++){
                    this.loaded.push(new_data.slice(i * this.limit_view, (i + 1) * this.limit_view))
                }
                
                // Если нет анимации у скрола, то можно грузить сразу
                if(!this.scroll.animated()) this.scroll.onAnimateEnd()
            },()=>{
                this.next_wait = false
            })
        }
    }
}