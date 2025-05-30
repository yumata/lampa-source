import Collection from './collection.js'

let network = new Lampa.Reguest()
let api_url = Lampa.Utils.protocol() + Lampa.Manifest.cub_domain + '/api/collections/'

let collections = [
    {
        hpu: 'user',
        title: 'Мои коллекции',
    },
    {
        hpu: 'new',
        title: 'Новинки',
    },
    {
        hpu: 'top',
        title: 'В топе',
    },
    {
        hpu: 'week',
        title: 'Популярные за неделю',
    },
    {
        hpu: 'month',
        title: 'Популярные за месяц',
    },
    {
        hpu: 'big',
        title: 'Большие коллекции',
    },
    {
        hpu: 'all',
        title: 'Все коллекции',
    }
]

function header(){
    let user = Lampa.Storage.get('account', '{}')

    if(!user.token) return false

    return {
        headers: {
            token: user.token,
            profile: user.id
        }
    }
}

function main(params, oncomplite, onerror){
    let user   = Lampa.Storage.get('account', '{}')
    let status = new Lampa.Status(collections.length)

    status.onComplite = ()=>{
        let keys = Object.keys(status.data)
        let sort = collections.map(a=>a.hpu)

        if(keys.length) {
            let fulldata = []

            keys.sort((a,b)=>{return sort.indexOf(a) - sort.indexOf(b)})

            keys.forEach(key=>{
                let data = status.data[key]
                    data.title = collections.find(item=>item.hpu == key).title

                    data.cardClass = (elem, param)=>{
                        return new Collection(elem, param)
                    }

                fulldata.push(data)
            })

            oncomplite(fulldata)
        }
        else onerror()
    }

    collections.forEach(item=>{
        if(item.hpu == 'user' && !user.token) return status.error()
        
        let url = api_url + 'list?category=' + item.hpu

        if(item.hpu == 'user') url = api_url + 'list?cid=' + user.id 

        network.silent(url, (data)=>{
            data.collection  = true
            data.line_type   = 'collection'
            data.category    = item.hpu

            status.append(item.hpu, data)
        }, status.error.bind(status), false, header())
    })
}

function collection(params, oncomplite, onerror){
    let url  = api_url + 'list?category='+params.url+'&page=' + params.page

    if(params.url.indexOf('user') >= 0){
        url = api_url + 'list?cid=' + params.url.split('_').pop() + '&page=' + params.page
    }

    network.silent(url, (data)=>{
        data.collection  = true
        data.total_pages = data.total_pages || 15
        data.cardClass = (elem, param)=>{
            return new Collection(elem, param)
        }

        oncomplite(data)
    }, onerror, false, header())
}

function liked(params, callaback){
    network.silent(api_url + 'liked', callaback, (a,e)=>{
        Lampa.Noty.show(network.errorDecode(a,e))
    }, params, header())
}

function full(params, oncomplite, onerror){
    network.silent(api_url + 'view/'+params.url+'?page=' + params.page, (data)=>{
        data.total_pages = data.total_pages || 15

        oncomplite(data)
    }, onerror, false, header())
}

function clear(){
    network.clear()
}

export default {
    main,
    collection,
    full,
    clear,
    liked
}