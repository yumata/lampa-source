import Utils from '../utils/utils'
import Platform from './platform'
import Noty from '../interaction/noty'

var widgetAPI,
    tvKey,
    pluginAPI,
    loader,
    orsay_loaded,
    orsay_call = Date.now()

function init() {

    $('body').append($(`<div style="position: absolute; left: -1000px; top: -1000px;">  
    <object id="pluginObjectNNavi" border="0" classid="clsid:SAMSUNG-INFOLINK-NNAVI" style="opacity: 0.0; background-color: #000; width: 1px; height: 1px;"></object>
    <object id="pluginObjectTVMW" border="0" classid="clsid:SAMSUNG-INFOLINK-TVMW" style="opacity: 0.0; background-color: #000; width: 1px; height: 1px;"></object>
    <object id="pluginObjectScreen" border=0 classid="clsid:SAMSUNG-INFOLINK-SCREEN" style="opacity: 0.0; background-color: #000; width: 1px; height: 1px;"></object>
</div>`))

    Utils.putScript([
        '$MANAGER_WIDGET/Common/API/Widget.js',
        '$MANAGER_WIDGET/Common/API/TVKeyValue.js',
        '$MANAGER_WIDGET/Common/API/Plugin.js',
        '$MANAGER_WIDGET/Common/webapi/1.0/webapis.js',
        '$MANAGER_WIDGET/Common/IME_XT9/ime.js',
        '$MANAGER_WIDGET/Common/IME_XT9/inputCommon/ime_input.js',

    ], () => {
        try {
            if (typeof Common !== 'undefined' && Common.API && Common.API.TVKeyValue && Common.API.Plugin && Common.API.Widget) {
                widgetAPI = new Common.API.Widget();
                tvKey = new Common.API.TVKeyValue();
                pluginAPI = new Common.API.Plugin();

                window.onShow = orsayOnshow;

                setTimeout(function () {
                    orsayOnshow();
                }, 2000);

                widgetAPI.sendReadyEvent();
                
            }
            else {
                if (orsay_call + 5 * 1000 > Date.now()) setTimeout(orsayOnLoad, 50);
            }
        }
        catch (e) { }
    })

    /**
    * Скрывает ненужные параметры для плеера
    */

    if(Platform.is('orsay')){
        function hidePlayerParams(){
            $('[data-name="player_normalization"],[data-name="player_scale_method"],[data-name="player_hls_method"]').toggleClass('hide',Lampa.Storage.field('player') == 'orsay')
        }

        /* Подписываемся на открытие настроек плера*/
        Lampa.Settings.listener.follow('open', function (e) {
            if(e.name == 'player') hidePlayerParams()
        })

        /* Подписываемся на изменение плера*/
        Lampa.Storage.listener.follow('change',(e)=>{
            if(e.name == 'player') hidePlayerParams()
        })
    }
}

function orsayOnshow() {
    if (orsay_loaded) return;

    orsay_loaded = true;

    try {
        //Включает анимацию изменения громкости на ТВ и т.д.
        pluginAPI.SetBannerState(1);
        //Отключает перехват кнопок, этими кнопками управляет система ТВ
        pluginAPI.unregistKey(tvKey.KEY_INFO);
        pluginAPI.unregistKey(tvKey.KEY_TOOLS);
        pluginAPI.unregistKey(tvKey.KEY_MENU);
        pluginAPI.unregistKey(tvKey.KEY_VOL_UP);
        pluginAPI.unregistKey(tvKey.KEY_VOL_DOWN);
        pluginAPI.unregistKey(tvKey.KEY_MUTE);
        // Отключаем заставку ТВ
        pluginAPI.setOffScreenSaver();
        console.log('App','Version widget ', Platform.version('orsay'));
    }
    catch (e) { }
}

function isNewWidget() {
    if (typeof window.top.WidgetLoader != 'undefined') {
        loader = window.top.WidgetLoader
        return true
    }
    else {
        return false
    }
}
function getLoaderUrl(){
    if(isNewWidget()){
        return loader.getUrl()
    }
}
function setLoaderUrl(_url){
    if(isNewWidget()){
        return loader.setUrl(_url)
    }
}
function changeLoaderUrl()
{
    if(isNewWidget()){
        return loader.changeUrl()
    }
}
function exit() {
    if(widgetAPI) widgetAPI.sendReturnEvent();
}

export default {
    init,
    isNewWidget,
    getLoaderUrl,
    setLoaderUrl,
    changeLoaderUrl,
    exit
}
