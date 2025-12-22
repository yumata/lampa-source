import Template from './template'
import Garland from './garland'

function pluginSnow(){
    window.plugin_snow_ready = true

    function add(){
        let logo = $(`<div class="head__logo-cap">
            ${Template.cap}
        </div>`)

        let garland = $(`<div class="garland">
            ${Template.garland}
        </div>`)

        $('.head .head__logo-icon').append(logo)
        $('.head').prepend(garland)

        $('body').append(`<style>@@include('../plugins/snow/css/style.css')</style>`)

        Garland.run(garland)
    }

    if(window.appready) add()
    else{
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') add()
        })
    }
}

if(!window.plugin_snow_ready) pluginSnow()