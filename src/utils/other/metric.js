import Manifest from '../manifest'
import Utils from '../math'
import Platform from '../platform'
import Storage from '../storage'

function init(){
    let today = new Date()
    let date  = today.toISOString().split('T')[0]

    if(Storage.get('metric_date') !== date){
        Storage.set('metric_date', date)
        Storage.set('metric_uid', Utils.uid(date))
    }

    $.ajax({
        dataType: 'json',
        url: Utils.protocol() + Manifest.cub_domain + '/api/metric/unic?platform=' + Platform.get() + '&uid=' + Storage.get('metric_uid',''),
    })
}

export default {
    init
}