function counter(method, v1, v2, v3){
    $.ajax({
        dataType: 'json',
        url: Lampa.Utils.protocol() + Lampa.Manifest.cub_domain + '/api/metric/stat?method='+method+'&value_one=' + (v1 || '') + '&value_two=' + (v2 || '') + '&value_three=' + (v3 || '')
    })
}

export default {
    counter
}