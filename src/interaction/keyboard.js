import Controller from './controller'
import Subscribe from '../utils/subscribe'
import Noty from './noty'
import Platform from '../utils/platform'
import Android from '../utils/android'
import Storage from '../utils/storage'
import Keypad from './keypad'
import Lang from '../utils/lang'
import Layers from './keyboard_layers'
import Arrays from '../utils/arrays'
import Select from './select'

function create(params = {}){
    let _keyClass = window.SimpleKeyboard.default,
        _keyBord

    let last
    let recognition
    let simple = Storage.field('keyboard_type') !== 'lampa'
    let input
    let last_value
    let height = window.innerHeight

    this.listener = Subscribe()

    this.create = function(){
        if(simple){
            input = $('<input type="text" class="simple-keyboard-input selector" placeholder="'+Lang.translate('search_input')+'..." />')

            
            let time_blur  = 0
            let time_focus = 0
            let stated,ended

            input.on('keyup change input keypress',(e)=>{
                let now_value = input.val()

                if(last_value !== now_value){
                    last_value = now_value

                    stated = ended = false

                    this.listener.send('change', {value: now_value})
                }
            })

            input.on('blur',()=>{
                Keypad.enable()

                time_blur = Date.now()
            })

            input.on('focus',()=>{
                Keypad.disable()

                time_focus = Date.now()
            })

            input.on('keyup',(e)=>{
                if(time_focus + 1000 > Date.now()) return

                let keys = [13,65376,29443,117,65385,461,27]
                let valu = input.val()
                let cart = e.target.selectionStart

                if(keys.indexOf(e.keyCode) >= 0){
                    e.preventDefault()

                    console.log('Keyboard','blur key:',e.keyCode, 'value:',valu)
                    
                    input.blur()
                } 

                if(e.keyCode == 13 || e.keyCode == 65376) this.listener.send('enter')

                if(e.keyCode == 37 && cart == 0 && height == window.innerHeight){
                    if(stated) input.blur(), this.listener.send('left')

                    stated = true
                    ended  = false
                }

                if(e.keyCode == 39 && cart >= valu.length && height == window.innerHeight){
                    if(ended) input.blur(), this.listener.send('right')

                    ended  = true
                    stated = false
                }

                if(e.keyCode == 40){
                    if(height == window.innerHeight) input.blur(), this.listener.send('down')
                }

                if(e.keyCode == 38){
                    if(height == window.innerHeight) input.blur(), this.listener.send('up')
                }
            })

            input.on('hover:focus',()=>{
                input.focus()
            })

            input.on('hover:enter',()=>{
                if(time_blur + 1000 < Date.now()) input.focus()
            })

            $('.simple-keyboard').append(input)
        }
        else{
            let layout = typeof params.layout == 'string' ? Layers.get(params.layout) : params.layout || Layers.get('default')
            let press  = Date.now()

            _keyBord = new _keyClass({
                display: {
                    '{BKSP}': '&nbsp;',
                    '{ENTER}': '&nbsp;',
                    '{SHIFT}': '&nbsp;',
                    '{SPACE}': '&nbsp;',
                    '{LANG}': '&nbsp;',
                    '{ABC}': 'Aa',
                    '{SIM}': '#+',
                    '{SEARCH}': Lang.translate('search'),
                    '{MIC}': `<svg viewBox="0 0 24 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5" width="14" height="23" rx="7" fill="currentColor"/>
                        <path d="M3.39272 18.4429C3.08504 17.6737 2.21209 17.2996 1.44291 17.6073C0.673739 17.915 0.299615 18.7879 0.607285 19.5571L3.39272 18.4429ZM23.3927 19.5571C23.7004 18.7879 23.3263 17.915 22.5571 17.6073C21.7879 17.2996 20.915 17.6737 20.6073 18.4429L23.3927 19.5571ZM0.607285 19.5571C2.85606 25.179 7.44515 27.5 12 27.5V24.5C8.55485 24.5 5.14394 22.821 3.39272 18.4429L0.607285 19.5571ZM12 27.5C16.5549 27.5 21.1439 25.179 23.3927 19.5571L20.6073 18.4429C18.8561 22.821 15.4451 24.5 12 24.5V27.5Z" fill="currentColor"/>
                        <rect x="10" y="25" width="4" height="6" rx="2" fill="currentColor"/>
                        </svg>`
                },

                layout: layout,

                onChange: (value)=>{
                    this.listener.send('change', {value: value})
                },
                onKeyPress: (button)=>{
                    if(Date.now() - press < 100) return

                    press = Date.now()

                    if (button === "{SHIFT}" || button === "{SIM}" || button === "{ABC}") this._handle(button)
                    else if(button === '{MIC}'){
                        if(Platform.is('android')){
                            Android.voiceStart()

                            window.voiceResult = this.value.bind(this)
                        }
                        else if(recognition){
                            try{
                                if(recognition.record) recognition.stop()
                                else recognition.start()
                            }
                            catch(e){
                                recognition.stop()
                            }
                        }
                    }
                    else if(button === '{LANG}'){
                        let codes = Lang.codes()
                        let items = []
                        let select_code = _keyBord.options.layoutName.split('-')[0]

                        items.push({
                            title: codes.ru,
                            value: 'default',
                            selected: select_code == 'default'
                        })

                        Arrays.getKeys(codes).forEach((code)=>{
                            if(layout[code]){
                                items.push({
                                    title: codes[code],
                                    value: code,
                                    selected: select_code == code
                                })
                            }
                        })

                        setTimeout(()=>{
                            Select.show({
                                title: Lang.translate('title_choice_language'),
                                items: items,
                                onSelect: (item)=>{
                                    Select.hide()

                                    Storage.set('keyboard_default_lang', item.value)

                                    let shifted    = _keyBord.options.layoutName.split('-')[1] == 'shift'
                                    let new_layout = item.value + (shifted ? '-shift' : '')

                                    this.shifted(!shifted, new_layout, item.value)

                                    _keyBord.setOptions({
                                        layoutName: new_layout
                                    })
                            
                                    last = false

                                    _keyBord.options.lastLayerSelect = _keyBord.options.layoutName
                            
                                    Controller.toggle('keybord')

                                    $('.simple-keyboard').attr('shifted',Boolean(shifted))

                                    Controller.collectionFocus($('.simple-keyboard [data-skbtn="{LANG}"]')[0], $('.simple-keyboard'))
                                },
                                onBack: ()=>{
                                    Select.hide()

                                    Controller.toggle('keybord')
                                }
                            })
                        },300)
                    }
                    else if(button === '{SPACE}'){
                        this.value(_keyBord.getInput() + ' ')
                    }
                    else if(button === '{BKSP}'){
                        this.value(_keyBord.getInput().slice(0, -1))
                    }
                    else if(button === '{ENTER}' || button === '{SEARCH}'){
                        this.listener.send('enter')
                    }
                }
            })

            let lang = Storage.get('keyboard_default_lang', Storage.get('language','ru')) 

            _keyBord.setOptions({
                layoutName: lang == 'ru' ? 'default' : Arrays.getKeys(layout).indexOf(lang) >= 0 ? lang : layout.en ? 'en' : 'default',
            })

            this.speechRecognition()
        }
    }

    this.speechRecognition = function(){
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

        console.log('Speech', 'status:', SpeechRecognition ? true : false)

        if(SpeechRecognition){
            recognition = new SpeechRecognition()
            recognition.continuous = false

            recognition.addEventListener("start", ()=>{
                console.log('Speech', 'start')

                $('.simple-keyboard [data-skbtn="{mic}"]').css('color','red')

                recognition.record = true

                Noty.show(Lang.translate('keyboard_listen'))
            })

            recognition.addEventListener("end", ()=>{
                console.log('Speech', 'end')

                $('.simple-keyboard [data-skbtn="{mic}"]').css('color','white')

                recognition.record = false
            })

            recognition.addEventListener("result", (event)=>{
                console.log('Speech', 'result:', event.resultIndex, event.results[event.resultIndex])

                let current    = event.resultIndex
                let transcript = event.results[current][0].transcript

                console.log('Speech', 'transcript:', transcript)

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

            recognition.addEventListener("error", (event)=>{
                console.log('Speech', 'error:', event)

                if (event.error == 'not-allowed') {
                    Noty.show(Lang.translate('keyboard_nomic'))
                }

                recognition.stop()
            })
        }
        else{
            $('.simple-keyboard [data-skbtn="{mic}"]').css('opacity','0.3')
        }
    }

    this.value = function(value){
        if(simple) input.val(value)
        else _keyBord.setInput(value)

        last_value = value

        this.listener.send('change', {value: value})
    }

    this._layout = function(){
        let keys = $('.simple-keyboard .hg-button').addClass('selector')

        Controller.collectionSet($('.simple-keyboard'))

        Controller.collectionFocus(last || keys[0], $('.simple-keyboard'))

        $('.simple-keyboard .hg-button:not(.binded)').on('hover:enter',function(e){
            Controller.collectionFocus($(this)[0])

            _keyBord.handleButtonClicked($(this).attr('data-skbtn'),e)
        }).on('hover:focus', (e)=>{
            last = e.target

            this.listener.send('hover', {button: e.target})
        })

        keys.addClass('binded')
    }

    this.shifted = function(shifted, layout, code){
        if(!(shifted && _keyBord.options.layout[layout])){
            let shift_layer = Arrays.clone(_keyBord.options.layout[code])

            shift_layer = shift_layer.map((button)=>button.toUpperCase())
                    
            _keyBord.options.layout[layout] = shift_layer
        }
    }

    this._handle = function(button){
        let current_layout = _keyBord.options.layoutName,
            layout = 'default',
            focus

        let shifted = current_layout.split('-')[1] == 'shift'
        let code    = current_layout.split('-')[0]

        $('.simple-keyboard').attr('shifted',Boolean(!shifted))

        if(button == '{SHIFT}'){
            if(shifted) layout = code
            else layout = code + '-shift'

            this.shifted(shifted, layout, code)
        }
        else if(button == '{SIM}'){
            layout = 'sim'
            focus  = '{ABC}'

            _keyBord.options.lastLayerSelect = current_layout
        }
        else if(button == '{ABC}'){
            layout = _keyBord.options.lastLayerSelect || 'default'

            focus = '{SIM}'
        }

        _keyBord.setOptions({
            layoutName: layout
        })

        last = false

        Controller.toggle('keybord')

        Controller.collectionFocus($('.simple-keyboard [data-skbtn="'+(focus || button)+'"]')[0], $('.simple-keyboard'))
    }

    this.toggle = function(){
        Controller.add('keybord',{
            toggle: ()=>{
                if(simple){
                    Controller.collectionSet($('.simple-keyboard'))
                    Controller.collectionFocus(false, $('.simple-keyboard'))
                } 
                else this._layout()
            },
            update: ()=>{},
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
            if(simple){
                input.remove()
            } 
            else _keyBord.destroy()
        }
        catch(e){}
        
        this.listener.destroy()

        Keypad.enable()
    }
}

export default create