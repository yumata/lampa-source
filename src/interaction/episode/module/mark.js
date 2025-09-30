import Timeline from '../../timeline'

export default {
    onCreate: function(){
        this.html.on('hover:enter', ()=>{
            if(Boolean(this.data.timeline.percent)){
                this.data.timeline.time    = 0
                this.data.timeline.percent = 0
            }
            else{
                this.data.timeline.time    = typeof this.data.timeline.duration == 'number' ? this.data.timeline.duration * 0.95 : 0
                this.data.timeline.percent = 95
            }

            Timeline.update(this.data.timeline)

            this.emit('viewed')
        })

        this.emit('viewed')
    }
}