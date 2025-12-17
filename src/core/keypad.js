import Subscribe from '../utils/subscribe'
import Controller from './controller'
import Orsay from './orsay'
import Sound from './sound'

let philipse = {
	play: typeof VK_PLAY !== 'undefined' ? VK_PLAY : typeof KEYCODE_MEDIA_PLAY !== 'undefined' ? KEYCODE_MEDIA_PLAY : -1,
	stop: typeof VK_STOP !== 'undefined' ? VK_STOP : typeof KEYCODE_MEDIA_STOP !== 'undefined' ? KEYCODE_MEDIA_STOP : -1,
	pause: typeof VK_PAUSE !== 'undefined' ? VK_PAUSE : typeof KEYCODE_MEDIA_PAUSE !== 'undefined' ? KEYCODE_MEDIA_PAUSE : -1,
	play_pause: typeof VK_PLAY_PAUSE !== 'undefined' ? VK_PLAY_PAUSE : typeof KEYCODE_MEDIA_PLAY_PAUSE !== 'undefined' ? KEYCODE_MEDIA_PLAY_PAUSE : -1,
}

let enabled  = false
let listener = Subscribe()
let time     = 0
let lastdown = 0
let timer
let longpress


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

function keydownTrigger(e){
	let keycode = keyCode(e)

	if(time > Date.now() - 100) return

	time = Date.now()

	listener.send('keydown',{code: keycode, enabled, event: e})

	if(e.defaultPrevented) return

	if(isEnter(keycode)) return

	if(!enabled) return; //отключить все

	//4 - Samsung orsay
	if (keycode == 37 || keycode == 4) {
		Sound.play('hover')

		listener.send('left', {code: keycode, enabled, event: e})

		Controller.move('left')
	}
	//29460 - Samsung orsay
	if (keycode == 38 || keycode == 29460) {
		Sound.play('hover')

		listener.send('up', {code: keycode, enabled, event: e})

		Controller.move('up')
	}
	//5 - Samsung orsay
	if (keycode == 39 || keycode == 5) {
		Sound.play('hover')

		listener.send('right', {code: keycode, enabled, event: e})

		Controller.move('right')
	}
	//5 - Samsung orsay
	//29461 - Samsung orsay
	if (keycode == 40 || keycode == 29461) {
		Sound.play('hover')

		listener.send('down', {code: keycode, enabled, event: e})

		Controller.move('down')
	}
	//33 - LG; 427 - Samsung
	if (keycode == 33 || keycode == 427) {
		Sound.play('hover')

		listener.send('toup', {code: keycode, enabled, event: e})

		Controller.move('toup')
	}
	//34 - LG; 428 - Samsung
	if (keycode == 34 || keycode == 428) {
		Sound.play('hover')

		listener.send('todown', {code: keycode, enabled, event: e})

		Controller.move('todown')
	}

	//Абсолютный Enter
	//29443 - Samsung orsay
	//65385 - Samsung tizen
	if (keycode == 13 || keycode == 29443 || keycode == 65385) { 
		//if(!App.Keybord.opened) Controller.finish();
	}

	//Space
	//10252 - Samsung tizen
	if(keycode == 32 || keycode == 179 || keycode == 10252 || keycode == philipse.play_pause){
		Controller.trigger('playpause');
	}

	//Samsung media
	//71 - Samsung orsay
	if(keycode == 415 || keycode == 71 || keycode == philipse.play){
		Controller.trigger('play');
	}

	//Samsung stop
	//70 - Samsung orsay
	if(keycode == 413 || keycode == philipse.stop|| keycode == 70){
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
	if(keycode == 19 || keycode == 74 || keycode == philipse.pause){
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
		e.preventDefault()

		listener.send('back', {code: keycode, enabled, event: e})

		if(window.appready) Controller.back()

		return false
	}
	//Exit orsay
	if(keycode == 45){
		Orsay.exit()
	}
	//Кнопка pre-ch вызывает окно смены адреса в Loader
	//259 - Samsung orsay
	if (keycode == 259) {
		if (Orsay.isNewWidget()) {
			Orsay.changeLoaderUrl();
		}
	}

	if(!(keycode == 122 || keycode == 123)) e.preventDefault()
}

function init(){
	window.addEventListener("keydown", function (e) {
		lastdown = keyCode(e)

		if(!timer){
			timer = setTimeout(()=>{
				if(isEnter(lastdown)){
					longpress = true

					listener.send('longdown', {code: lastdown, enabled, event: e})

					Controller.long()
				}
			},800)
		}
	})

	window.addEventListener("keyup", function (e) {
		clearTimeout(timer)

		time = 0

		timer = null

		listener.send('keyup',{code: keyCode(e), enabled, event: e})

		if(!longpress){
			if(isEnter(keyCode(e)) && !e.defaultPrevented){
				Sound.play('enter')

				listener.send('enter', {code: keyCode(e), enabled, event: e})

				Controller.enter()
			} 
		}
		else longpress = false
	})

	window.addEventListener("keydown", keydownTrigger)
}

export default {
    listener,
	init,
    enable,
    disable
}
