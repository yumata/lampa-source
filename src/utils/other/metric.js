import Manifest from '../manifest'
import Utils from '../math'
import Platform from '../platform'
import Storage from '../storage'
import Account from '../account'

function init(){
    let today = new Date()
    let date  = today.toISOString().split('T')[0]

    if(Storage.get('metric_date') !== date){
        if(Storage.get('metric_adview', 0) > 0) histogram('adview', Storage.get('metric_adview', 0))
        
        Storage.set('metric_date', date)
        Storage.set('metric_adview', 0)
    }

    if(!Storage.get('metric_uid', '')) Storage.set('metric_uid', Utils.uid())

    $.ajax({
        dataType: 'json',
        url: Utils.protocol() + Manifest.cub_domain + '/api/metric/unic?platform=' + Platform.get() + '&uid=' + Storage.get('metric_uid','') + '&premium=' + (Account.hasPremium() ? 1 : 0),
    })

    counter('screen', Platform.get(), Platform.screen('tv') ? 'tv' : 'mobile')

    Lampa.Player.listener.follow('start', (data)=>{
        if(!data.iptv) counter('player_start', Platform.get(), 'inner', data.torrent_hash ? 'torrent' : data.youtube ? 'youtube' : data.continue_play ? 'continue' : 'online')
    })

    Lampa.Player.listener.follow('external', (data)=>{
        counter('player_start', Platform.get(), 'external', data.torrent_hash ? 'torrent' : data.youtube ? 'youtube' : data.continue_play ? 'continue' : 'online')
    })
}

function counter(method, v1, v2, v3){
    $.ajax({
        dataType: 'json',
        url: Utils.protocol() + Manifest.cub_domain + '/api/metric/stat?method='+method+'&value_one=' + (v1 || '') + '&value_two=' + (v2 || '') + '&value_three=' + (v3 || '')
    })
}

function histogram(method, value){
    $.ajax({
        dataType: 'json',
        url: Utils.protocol() + Manifest.cub_domain + '/api/metric/histogram?method='+method+'&value=' + (value || 0)
    })
}

export default {
    init,
    counter,
    histogram
}