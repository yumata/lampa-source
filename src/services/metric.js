import Manifest from '../core/manifest'
import Utils from '../utils/utils'
import Platform from '../core/platform'
import Storage from '../core/storage/storage'

/**
 * Инициализация сбора анонимной метрики
 * @returns {void}
 */
function init(){
    let today = new Date()
    let date  = today.toISOString().split('T')[0]

    if(Storage.get('metric_date') !== date){
        Storage.set('metric_date', date)
        Storage.set('metric_uid', Utils.uid())
    }

    $.ajax({
        dataType: 'json',
        url: Utils.protocol() + Manifest.cub_domain + '/api/metric/unic?platform=' + Platform.get() + '&uid=' + Storage.get('metric_uid',''),
    })
}

export default {
    init
}