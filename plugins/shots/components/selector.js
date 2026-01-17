function Selector(list){
    this.html = $('<div class="shots-selector-tags"></div>')
    this.list = list || []

    this.selected = []

    this.create = function(){
        this.list.forEach(t=>{
            let tag = $('<div class="shots-selector-tags__tag selector"><span>'+t.title+'</span></div>')

            tag.on('hover:enter', (e)=>{
                tag.toggleClass('active')

                if(this.selected.indexOf(t) == -1){
                    this.selected.push(t)
                }
                else {
                    Lampa.Arrays.remove(this.selected, t)
                }
            })

            this.html.append(tag)
        })
    }

    this.get = function(){
        return this.selected
    }

    this.render = function(){
        return this.html
    }

    this.destroy = function(){
        this.html.remove()
    }
}

export default Selector