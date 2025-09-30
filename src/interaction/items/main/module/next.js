import Layer from '../../../../core/layer'

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

            this.object.page++

            this.emit('next', (new_data)=>{
                this.next_wait = false

                if(!this.items.length) return

                new_data.forEach(this.emit.bind(this, 'createAndAppend'))

                Layer.visible(this.scroll.render(true))
            },()=>{
                this.next_wait = false
            })
        }
    }
}