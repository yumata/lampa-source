import Subscribe from '../utils/subscribe'
import Controller from './controller'
import Activity from './activity'


let enabled  = false
let listener = Subscribe()
let time     = 0
let lastdown = 0
let timer


function toggle(new_status){
    enabled = new_status

    listener.send('toggle',{status: enabled})
}

function enable(){
    toggle(true)
}

function disable(){
    toggle(false)
}

function isEnter(keycode){
	return keycode == 13 || keycode == 29443 || keycode == 117 || keycode == 65385
}

function keyCode(e){
	var keycode
	 
	if(window.event) { 
	    keycode = e.keyCode;
	} else if(e.which) { 
	    keycode = e.which;
	}

	return keycode
}

window.addEventListener("keydown", function (e) {
	lastdown = keyCode(e)

	time = Date.now()

	if(!timer){
		timer = setTimeout(()=>{
			if(isEnter(lastdown)){
				listener.send('longdown',{})

				Controller.long()
			}
		},800)
	}
})

window.addEventListener("keyup", function (e) {
	clearTimeout(timer)

	timer = null

	if(Date.now() - time > 40){
		if(isEnter(keyCode(e))) Controller.enter()
	}
})

window.addEventListener("keydown", function (e) {
    let keycode = keyCode(e)

    listener.send('keydown',{code: keycode, enabled: enabled})

	if(isEnter(keycode)) return

    if(!enabled) return; //отключить все

	//4 - Samsung orsay
	if (keycode == 37 || keycode == 4) { 
		Controller.move('left');
	}
	//29460 - Samsung orsay
	if (keycode == 38 || keycode == 29460) { 
		Controller.move('up');
	}
	//5 - Samsung orsay
	if (keycode == 39 || keycode == 5) {
		Controller.move('right');
	}
	//5 - Samsung orsay
	//29461 - Samsung orsay
	if (keycode == 40 || keycode == 29461) { 
		Controller.move('down');
	}
	//33 - LG; 427 - Samsung
	if (keycode == 33 || keycode == 427) { 
		Controller.move('toup');
	}
	//34 - LG; 428 - Samsung
	if (keycode == 34 || keycode == 428) { 
		Controller.move('todown');
	}

	//Абсолютный Enter
	//29443 - Samsung orsay
	//65385 - Samsung tizen
	if (keycode == 13 || keycode == 29443 || keycode == 65385) { 
		//if(!App.Keybord.opened) Controller.finish();
	}

	//Space
	if(keycode == 32 || keycode == 179){
		Controller.trigger('playpause');
	}

	//Samsung media
	//71 - Samsung orsay
	if(keycode == 415 || keycode == 71){
		Controller.trigger('play');
	}

	//Samsung stop
	if(keycode == 413){
		Controller.trigger('stop');
	}

	//69 - Samsung orsay
	if(keycode == 412 || keycode == 69 || keycode == 177){
		Controller.trigger('rewindBack');
	}

	//72 - Samsung orsay
	if(keycode == 418 || keycode == 417 || keycode == 72 || keycode == 176){
		Controller.trigger('rewindForward');
	}

	//74 - Samsung orsay
	if(keycode == 19 || keycode == 74){
		Controller.trigger('pause');
	}

	if(keycode == 457){
		Controller.trigger('info');
	}

	//E-Manual
	if(keycode == 10146){
		e.preventDefault()
	}

	if(keycode == 10133){
		Controller.toggle('settings')
	}
	
    //Кнопка назад
	//8 - браузер
	//27
	//461 - LG
	//10009 - Samsung
	//88 - Samsung orsay
	if (keycode == 8 || keycode == 27 || keycode == 461 || keycode == 10009 || keycode == 88) {
		e.preventDefault();

		Activity.back();

		return false;
	}

	e.preventDefault()
})

export default {
    listener,
    enable,
    disable
}