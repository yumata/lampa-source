function Endless(params = {}){
	let wrap     = $('<div class="endless"></div>')
	let position = 0
	let items    = []

	this.init = function(){
		for(let i = 0; i < params.total; i++){
			let item = this.onRender(i)

			items.push(item)
		}
	}

	this.to = function(to){
		let dif = position - to

		position = to

		items.forEach(elem=>{
			elem.detach()
		})

        let start  = Math.max(0,position - params.minimal)
		let select = items.slice(Math.max(0,start - 1), start + (params.display + 1))

		select.forEach(elem=>{
			wrap.append(elem)
		})

		if(position > params.minimal && dif !== 0){
			let proto = wrap.find('> div:eq(0)')
			let scale = Math.round(params.vertical ? proto.height() : proto.width())
            let spos  = dif < 0 ? 0 : -(scale*2)
            
			wrap.css({
				'transition': 'transform 0s',
				'transform': 'translate3d('+(params.vertical ? '0,'+spos+'px,0' : spos+'px,0,0')+')'
			})

			setTimeout(()=>{
				wrap.css({
					'transition': 'transform 0.1s linear',
					'transform': 'translate3d('+(params.vertical ? '0,'+(-scale)+'px,0' : (-scale)+'px,0,0')+')'
				})
			},0)
			
		}
		else if(position < (params.minimal + 1)){
			wrap.css({
				'transform': 'translate3d(0,0,0)'
			})
		}
	}

	this.offset = function(dir){
		let to = position
			to += dir
			to = Math.max(0,Math.min(params.total - params.display,to))

		this.to(to)
	}

	this.render = function(){
		return wrap
	}

	this.destroy = function(){
		items = null

		wrap.remove()
	}
}


export default Endless