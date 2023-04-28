function Endless(onRender, params = {}){
	let wrap     = document.createElement('div')
	let position = params.position || 0

	wrap.addClass('endless')

	wrap.addEventListener('mousewheel',(e)=>{
		this.move(e.wheelDelta / 120 > 0 ? -1 : 1)
    })

	let touch

	let touchStart = (e)=>{
		let point = e.touches[0] || e.changedTouches[0]

		touch = {
			position,
			from: point.clientY,
			to: 0
		}

		window.addEventListener('touchend', touchEnd)
		window.addEventListener('touchmove', touchMove)
	}

	let touchMove = (e)=>{
		let point = e.touches[0] || e.changedTouches[0]

		if(touch){
			let to = Math.round((point.clientY - touch.from) / (window.innerHeight * 0.1))

			if(touch.to !== to){
				let move = touch.position - to

				touchEnd()

				this.to(move)
			}
		}
	}

	let touchEnd = (e)=>{
		window.removeEventListener('touchend', touchEnd)
		window.removeEventListener('touchmove', touchMove)

		touch = false
	}

	wrap.addEventListener('touchstart',touchStart)

	this.move = function(dir){
		let dif = position - (position + dir)

		position += dir

		this.draw(dif)
	}

	this.to = function(to){
		let dif = position - to

		position = to

		this.draw(dif)
	}

	this.draw = function(dif){
		let render = onRender(position)

		if(render){
			wrap.removeClass('endless-up endless-down')

			wrap.style.animation = 'none'
			wrap.offsetHeight
			wrap.style.animation = null

			wrap.empty().append(render)

			wrap.addClass(dif == -1 ? 'endless-down' : 'endless-up')
		}
	}

	this.render = function(){
		return wrap
	}

	this.destroy = function(){
		wrap.remove()
	}

	this.draw(0)
}


export default Endless