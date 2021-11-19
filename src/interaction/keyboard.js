import Controller from './controller'
import Subscribe from '../utils/subscribe'

function create(params = {}){
	let _keyClass = window.SimpleKeyboard.default,
		_keyBord

    let last

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
                '{search}':'найти'
			},

			layout: params.layout || _default_layout,

			onChange: (value)=>{
                this.listener.send('change', {value: value})
			},
			onKeyPress: (button)=>{
				if (button === "{shift}" || button === "{abc}" || button === "{EN}" || button === "{RU}" || button === "{rus}" || button === "{eng}") this._handle(button);
				else if(button === '{enter}' || button === '{search}'){
                    this.listener.send('enter')
				}
			}
		})
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