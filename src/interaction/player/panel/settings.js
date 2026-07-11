import Controller from '../../../core/controller'
import Select from '../../select'
import Storage from '../../../core/storage/storage'
import Platform from '../../../core/platform'
import Lang from '../../../core/lang'
import Video from '../video'
import listener from './listener'

let last_action

/**
 * Показать настройки плеера
 */
function show(){
    let speed = Storage.get('player_speed','default')
    let items = [
        {
            title: Lang.translate('player_video_size'),
            subtitle: Lang.translate('player_size_' + Storage.get('player_size','default') + '_title'),
            method: 'size'
        },
        {
            title: Lang.translate('player_video_speed'),
            subtitle: speed == 'default' ? Lang.translate('player_speed_default_title') : speed,
            method: 'speed'
        },
        {
            title: Lang.translate('player_share_title'),
            subtitle: Lang.translate('player_share_descr'),
            method: 'share'
        },
        {
            title: Lang.translate('player_segments_title'),
            subtitle: Lang.translate('player_segments_descr'),
            method: 'segments'
        },
        {
            title: Lang.translate('settings_player_subs'),
            method: 'subs'
        }
    ]

    if(Storage.field('player_normalization')){
        items.push({
            title: Lang.translate('player_normalization'),
            separator: true
        })

        items.push({
            title: Lang.translate('player_normalization_power_title'),
            subtitle: Lang.translate('player_normalization_step_' + Storage.get('player_normalization_power','hight')),
            method: 'normalization_power'
        })

        items.push({
            title: Lang.translate('player_normalization_smooth_title'),
            subtitle: Lang.translate('player_normalization_step_' + Storage.get('player_normalization_smooth','medium')),
            method: 'normalization_smooth'
        })

        items.push({
            title: Lang.translate('player_normalization_type_title'),
            subtitle: Lang.translate('player_normalization_type_' + Storage.get('player_normalization_type','all')),
            method: 'normalization_type'
        })
    }

    if(last_action){
        items.find(a => a.method == last_action).selected = true
    }

    Select.show({
        title: Lang.translate('title_settings'),
        items,
        nomark: true,
        onSelect: (a) => {
            last_action = a.method

            if(a.method == 'size') selectSize()
            if(a.method == 'speed') selectSpeed()
            if(a.method == 'normalization_power') selectNormalizationStep('power','hight')
            if(a.method == 'normalization_smooth') selectNormalizationStep('smooth','medium')
            if(a.method == 'normalization_type') selectNormalizationType()
            if(a.method == 'segments') selectSegments()
            if(a.method == 'subs') selectSubs()
            if(a.method == 'share'){
                Controller.toggle(Platform.screen('mobile') ? 'player' : 'player_panel')

                listener.send('share',{})
            }
        },
        onBack: () => {
            Controller.toggle(Platform.screen('mobile') ? 'player' : 'player_panel')
        }
    })
}

function selectSubs(){
    let items = [
        {
            title: Lang.translate('settings_player_subs_size'),
            subtitle: Lang.translate('settings_player_subs_size_descr'),
            name: 'subtitles_size'
        },
        {
            title: Lang.translate('settings_player_subs_stroke_use'),
            subtitle: Lang.translate('settings_player_subs_stroke_use_descr'),
            name: 'subtitles_stroke'
        },
        {
            title: Lang.translate('settings_player_subs_backdrop_use'),
            subtitle: Lang.translate('settings_player_subs_backdrop_use_descr'),
            name: 'subtitles_backdrop'
        },
        {
            title: Lang.translate('settings_rest_time'),
            name: 'player_subs_shift_time'
        }
    ]

    Select.show({
        title: Lang.translate('settings_player_subs'),
        items: items,
        nohide: true,
        onBack: show,
        onSelect: (a) => {
            let subitems = []

            if(a.name == 'subtitles_size'){
                subitems = [
                    {title: Lang.translate('settings_param_subtitles_size_small'), value: 'small'},
                    {title: Lang.translate('settings_param_subtitles_size_normal'), value: 'normal'},
                    {title: Lang.translate('settings_param_subtitles_size_bigger'), value: 'large'}
                ]
            }

            if(a.name == 'subtitles_stroke' || a.name == 'subtitles_backdrop'){
                subitems = [
                    {title: Lang.translate('settings_param_yes'), value: 'true'},
                    {title: Lang.translate('settings_param_no'), value: 'false'}
                ]
            }

            if(a.name == 'player_subs_shift_time'){
                subitems = [-120, -90, -60, -30, -10, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 10, 30, 60, 90, 120]

                subitems = subitems.map(i => {
                    return {
                        title: (i > 0 ? '+' : '') + i + ' sec.',
                        value: i,
                        selected: Storage.get('player_subs_shift_time','0') == i
                    }
                })
            }
            else{
                subitems.forEach(i => {
                    i.selected = (Storage.field(a.name) + '') == i.value
                })
            }

            Select.show({
                title: a.title,
                items: subitems,
                nohide: true,
                onBack: selectSubs,
                onSelect: (b) => {
                    Storage.set(a.name, b.value)

                    listener.send('subs',{type: a.name, value: b.value})

                    selectSubs()
                }
            })
        }
    })
}

function selectSegments(){
    let items = [
        {
            title: Lang.translate('player_segments_ad_title'),
            name: 'ad',
            subtitle: Lang.translate('player_segments_value_' + Storage.get('player_segments_ad','auto')),
        },
        {
            title: Lang.translate('player_segments_skip_title'),
            name: 'skip',
            subtitle: Lang.translate('player_segments_value_' + Storage.get('player_segments_skip','auto')),
        },
    ]

    Select.show({
        title: Lang.translate('player_segments_title'),
        items: items,
        nohide: true,
        onBack: show,
        onSelect: (a) => {
            Select.show({
                title: a.title,
                items: [
                    {title: Lang.translate('player_segments_value_auto'), value: 'auto', selected: Storage.get('player_segments_'+a.name,'auto') == 'auto'},
                    {title: Lang.translate('player_segments_value_user'), value: 'user', selected: Storage.get('player_segments_'+a.name,'auto') == 'user'},
                    {title: Lang.translate('player_segments_value_none'), value: 'none', selected: Storage.get('player_segments_'+a.name,'auto') == 'none'}
                ],
                nohide: true,
                onBack: selectSegments,
                onSelect: (b) => {
                    Storage.set('player_segments_'+a.name, b.value)

                    listener.send('segments',{type: a.name, value: b.value})

                    selectSegments()
                }
            })
        }
    })
}

function selectNormalizationType(){
    let select = Storage.get('player_normalization_type','all')

    let items = [
        {title: Lang.translate('player_normalization_type_all'), value: 'all', selected: select == 'all'},
        {title: Lang.translate('player_normalization_type_up'), value: 'up', selected: select == 'up'},
        {title: Lang.translate('player_normalization_type_down'), value: 'down', selected: select == 'down'}
    ]

    Select.show({
        title: Lang.translate('player_normalization_type_title'),
        items: items,
        nohide: true,
        onBack: show,
        onSelect: (a) => {
            Storage.set('player_normalization_type', a.value)

            listener.send('normalization',{type: 'type', value: a.value})

            show()
        }
    })
}

function selectNormalizationStep(type, def){
    let select = Storage.get('player_normalization_'+type, def)

    let items = [
        {title: Lang.translate('player_normalization_step_none'), value: 'none', selected: select == 'none'},
        {title: Lang.translate('player_normalization_step_low'), value: 'low', selected: select == 'low'},
        {title: Lang.translate('player_normalization_step_medium'), value: 'medium', selected: select == 'medium'},
        {title: Lang.translate('player_normalization_step_hight'), value: 'hight', selected: select == 'hight'}
    ]

    Select.show({
        title: Lang.translate('player_normalization_'+type+'_title'),
        items: items,
        nohide: true,
        onBack: show,
        onSelect: (a) => {
            Storage.set('player_normalization_'+type, a.value)

            listener.send('normalization',{type: type, value: a.value})

            show()
        }
    })
}

function selectSize(){
    let select = Storage.get('player_size','default')

    let items = [
        {
            title: Lang.translate('player_size_default_title'),
            subtitle: Lang.translate('player_size_default_descr'),
            value: 'default',
            selected: select == 'default'
        },
        {
            title: Lang.translate('player_size_cover_title'),
            subtitle: Lang.translate('player_size_cover_descr'),
            value: 'cover',
            selected: select == 'cover'
        }
    ]

    if(Platform.is('orsay') && Storage.field('player') == 'orsay'){
        items.splice(1,1)
    }

    if(!(Platform.is('tizen') && Storage.field('player') == 'tizen')){
        items = items.concat([
            {
                title: Lang.translate('player_size_fill_title'),
                subtitle: Lang.translate('player_size_fill_descr'),
                value: 'fill',
                selected: select == 'fill'
            },
            {
                title: Lang.translate('player_size_s115_title'),
                subtitle: Lang.translate('player_size_s115_descr'),
                value: 's115',
                selected: select == 's115'
            },
            {
                title: Lang.translate('player_size_s130_title'),
                subtitle: Lang.translate('player_size_s130_descr'),
                value: 's130',
                selected: select == 's130'
            },
            {
                title: Lang.translate('player_size_v115_title'),
                subtitle: Lang.translate('player_size_v115_descr'),
                value: 'v115',
                selected: select == 'v115'
            },
            {
                title: Lang.translate('player_size_v130_title'),
                subtitle: Lang.translate('player_size_v130_descr'),
                value: 'v130',
                selected: select == 'v130'
            }
        ])
    }
    else{
        if(select == 's130' || select == 'fill'){
            items[0].selected = true
        }
    }

    Select.show({
        title: Lang.translate('player_video_size'),
        items: items,
        nohide: true,
        onSelect: (a) => {
            listener.send('size',{size: a.value})
        },
        onBack: show
    })
}

function selectSpeed(){
    let select = Storage.get('player_speed','default')

    let items = [
        {title: '0.25', value: '0.25'},
        {title: '0.50', value: '0.50'},
        {title: '0.75', value: '0.75'},
        {title: Lang.translate('player_speed_default_title'), value: 'default'},
        {title: '1.25', value: '1.25'},
        {title: '1.50', value: '1.50'},
        {title: '1.75', value: '1.75'},
        {title: '2', value: '2'},
    ]

    if(Platform.is('tizen') && Storage.field('player') == 'tizen' || (Platform.is('orsay') && Storage.field('player') == 'orsay')){
        items = [
            {
                title: Lang.translate('player_speed_default_title'),
                value: 'default',
                selected: select == 'default'
            },
            {
                title: '2',
                subtitle: Platform.is('orsay') && Storage.field('player') == 'orsay' ? Lang.translate('player_speed_two_descr') : '',
                value: '2'
            }
        ]
    }

    let any

    items.forEach(e => {
        if(e.value == select){
            any = true

            e.selected = true
        }
    })

    if(!any){
        Storage.set('player_speed','default')

        if(items.length == 3) items[0].selected = true
        else items[3].selected = true
    }

    Select.show({
        title: Lang.translate('player_video_speed'),
        items: items,
        nohide: true,
        onSelect: (a) => {
            Storage.set('player_speed', a.value)

            listener.send('speed',{speed: a.value})

            show()
        },
        onBack: show
    })
}

export default {
    listener,
    show 
}
