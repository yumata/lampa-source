let network = new Lampa.Reguest()
let api_url = Lampa.Utils.protocol() + Lampa.Manifest.cub_domain + '/api/collections/'

function main(params, oncomplite, onerror){
    network.silent(api_url + 'list?page=' + params.page, (data)=>{
        data.collection  = true
        data.total_pages = data.total_pages || 5

        data.results.forEach(element => {
            element.poster_path   = element.img
            element.backdrop_path = element.img
        })

        oncomplite(data)
    }, onerror)
}

function full(params, oncomplite, onerror){
    network.silent(api_url + 'view/'+params.url+'?page=' + params.page, (data)=>{
        data.total_pages = data.total_pages || 15

        oncomplite(data)
    }, onerror)
}

function clear(){
    network.clear()
}

export default {
    main,
    full,
    clear
}