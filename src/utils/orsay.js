import Utils from './math'

var widgetAPI,
    tvKey,
    pluginAPI,
    orsay_loaded,
    orsay_call = Date.now()

function init() {

    $('body').append($(`<div style="position: absolute; left: -1000px; top: -1000px;">
    <object id="pluginObjectNNavi" border="0" classid="clsid:SAMSUNG-INFOLINK-NNAVI" style="opacity: 0.0; background-color: #000; width: 1px; height: 1px;"></object>
    <object id="pluginObjectTVMW" border="0" classid="clsid:SAMSUNG-INFOLINK-TVMW" style="opacity: 0.0; background-color: #000; width: 1px; height: 1px;"></object>
    <object id="pluginObjectSef" border="0" classid="clsid:SAMSUNG-INFOLINK-SEF" style="opacity:0.0;background-color:#000;width:1px;height:1px;"></object>
</div>`))

    Utils.putScript([
        '$MANAGER_WIDGET/Common/API/Widget.js',
        '$MANAGER_WIDGET/Common/API/TVKeyValue.js',
        '$MANAGER_WIDGET/Common/API/Plugin.js',
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
    }
    )
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
    }
    catch (e) { }
};

function exit() {
    if(widgetAPI) widgetAPI.sendReturnEvent();
}

export default {
    init,
    exit
}
