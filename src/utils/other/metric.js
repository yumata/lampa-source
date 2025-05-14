import Favorite from '../favorite'
import Manifest from '../manifest'
import Utils from '../math'
import Platform from '../platform'
import Storage from '../storage'

function init(){
    $.ajax({
        dataType: 'json',
        url: Utils.protocol() + Manifest.cub_domain + '/api/metric/unic?platform=' + Platform.get() + '&uid=' + Storage.get('lampa_uid',''),
    })
}

export default {
    init
}