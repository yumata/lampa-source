import Controller from './controller'
import Subscribe from '../utils/subscribe'

function create(params = {}){
	let _keyClass = window.SimpleKeyboard.default,
		_keyBord

    let last
    let recognition

    let _default_layout = {
        'en': [
            '{abc} 1 2 3 4 5 6 7 8 9 0 - + = {bksp}',
            '{RU} q w e r t y u i o p',
            'a s d f g h j k l /',
            '{shift} z x c v b n m , . : http://',
            '{space}'
        ],
        'en-shift': [
            '{abc} 1 2 3 4 5 6 7 8 9 0 - + = {bksp}',
            '{RU} Q W E R T Y U I O P',
            'A S D F G H J K L /',
            '{shift} Z X C V B N M , . : http://',
            '{space}'
        ],
        'abc': [
            '1 2 3 4 5 6 7 8 9 0 - + = {bksp}',
            '! @ # $ % ^ & * ( ) [ ]',
            '- _ = + \\ | [ ] { }',
            '; : \' " , . < > / ?',
            '{rus} {space} {eng}'
        ],
        'default': [
            '{abc} 1 2 3 4 5 6 7 8 9 0 - + = {bksp}',
            '{EN} й ц у к е н г ш щ з х ъ',
            'ф ы в а п р о л д ж э',
            '{shift} я ч с м и т ь б ю , . : http://',
            '{space}'
        ],
        'ru-shift': [
            '{abc} 1 2 3 4 5 6 7 8 9 0 - + = {bksp}',
            '{EN} Й Ц У К Е Н Г Ш Щ З Х Ъ',
            'Ф Ы В А П Р О Л Д Ж Э',
            '{shift} Я Ч С М И Т Ь Б Ю , . : http://',
            '{space}'
        ],
    }

    this.listener = Subscribe()

	this.create = function(){
		_keyBord = new _keyClass({
			display: {
				'{bksp}': '&nbsp;',
				'{enter}': '&nbsp;',
				'{shift}': '&nbsp;',
				'{space}': '&nbsp;',
				'{RU}': '&nbsp;',
				'{EN}': '&nbsp;',
				'{abc}': '&nbsp;',
                '{rus}': 'русский',
                '{eng}': 'english',
                '{search}':'найти',
                '{mic}': `<svg width="12" height="16" viewBox="0 0 24 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" width="14" height="23" rx="7" fill="currentColor"/>
                    <path d="M3.39272 18.4429C3.08504 17.6737 2.21209 17.2996 1.44291 17.6073C0.673739 17.915 0.299615 18.7879 0.607285 19.5571L3.39272 18.4429ZM23.3927 19.5571C23.7004 18.7879 23.3263 17.915 22.5571 17.6073C21.7879 17.2996 20.915 17.6737 20.6073 18.4429L23.3927 19.5571ZM0.607285 19.5571C2.85606 25.179 7.44515 27.5 12 27.5V24.5C8.55485 24.5 5.14394 22.821 3.39272 18.4429L0.607285 19.5571ZM12 27.5C16.5549 27.5 21.1439 25.179 23.3927 19.5571L20.6073 18.4429C18.8561 22.821 15.4451 24.5 12 24.5V27.5Z" fill="currentColor"/>
                    <rect x="10" y="25" width="4" height="6" rx="2" fill="currentColor"/>
                    </svg>`
			},

			layout: params.layout || _default_layout,

			onChange: (value)=>{
                this.listener.send('change', {value: value})
			},
			onKeyPress: (button)=>{
				if (button === "{shift}" || button === "{abc}" || button === "{EN}" || button === "{RU}" || button === "{rus}" || button === "{eng}") this._handle(button);
                else if(button === '{mic}'){
                    if(recognition){
                        if(recognition.record) recognition.stop()
                        else recognition.start()
                    }
                }
				else if(button === '{enter}' || button === '{search}'){
                    this.listener.send('enter')
				}
			}
		})

        this.speechRecognition()
	}

    this.speechRecognition = function(){
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

        if(SpeechRecognition){
			recognition = new SpeechRecognition()
			recognition.continuous = false

			recognition.addEventListener("start", ()=>{
                $('.simple-keyboard [data-skbtn="{mic}"]').css('color','red')

                recognition.record = true
            })

			recognition.addEventListener("end", ()=>{
                $('.simple-keyboard [data-skbtn="{mic}"]').css('color','white')

                recognition.record = false
            })

			recognition.addEventListener("result", (event)=>{
                let current    = event.resultIndex
				let transcript = event.results[current][0].transcript

				if(transcript.toLowerCase().trim() === "stop recording") {
					recognition.stop()
				}
				else {
					if(transcript.toLowerCase().trim() === "reset input") {
						this.value('')
					}
					else {
                        this.value(transcript)
					}
				}
            })

			recognition.addEventListener("error", ()=>{
				recognition.stop()
			})
		}
    }

    this.value = function(value){
        _keyBord.setInput(value)

        this.listener.send('change', {value: value})
    }

    this._layout = function(){
		let keys = $('.simple-keyboard .hg-button').addClass('selector')

		Controller.collectionSet($('.simple-keyboard'))

		Controller.collectionFocus(last || keys[0], $('.simple-keyboard'))

		$('.simple-keyboard .hg-button:not(.binded)').on('hover:enter',function(e, click){
			Controller.collectionFocus($(this)[0])

			if(!click) _keyBord.handleButtonClicked($(this).attr('data-skbtn'),e)
		}).on('hover:focus', (e)=>{
			last = e.target
		})

        keys.addClass('binded')
	}

    this._handle = function(button){
		var current_layout = _keyBord.options.layoutName,
			layout = 'default'

		if(button == '{shift}'){
			if(current_layout == 'default') layout = 'ru-shift';
			else if(current_layout == 'ru-shift') layout = 'default';
			else if(current_layout == 'en') layout = 'en-shift';
			else if(current_layout == 'en-shift') layout = 'en';
		}
		else if(button == '{abc}') layout = 'abc';
		else if(button == '{EN}' || button == '{eng}') layout = 'en';
		else if(button == '{RU}' || button == '{rus}') layout = 'default';


		_keyBord.setOptions({
			layoutName: layout
		})

        last = false

		Controller.toggle('keybord')
	}

    this.toggle = function(){
        Controller.add('keybord',{
            toggle: ()=>{
                this._layout()
            },
            up: ()=>{
                if(!Navigator.canmove('up')){
                    this.listener.send('up')
                }
                else Navigator.move('up')
            },
            down: ()=>{
                if(!Navigator.canmove('down')){
                    this.listener.send('down')
                }
                else Navigator.move('down')
            },
            left: ()=>{
                if(!Navigator.canmove('left')){
                    this.listener.send('left')
                }
                else Navigator.move('left')
            },
            right: ()=>{
                if(!Navigator.canmove('right')){
                    this.listener.send('right')
                }
                else Navigator.move('right')
            },
            back: ()=>{
                this.listener.send('back')
            }
        })

        Controller.toggle('keybord')
    }


    this.destroy = function(){
        try{
            _keyBord.destroy()
        }
        catch(e){

        }
		
        this.listener.destroy()
	}
}

export default create