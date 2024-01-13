class Pilot{
    static notebook(param_name, param_set){
        let book = Lampa.Storage.get('iptv_pilot_book','{}')

        Lampa.Arrays.extend(book, {
            playlist: '',
            channel: -1,
            category: ''
        })

        if(typeof param_set !== 'undefined'){
            book[param_name] = param_set

            Lampa.Storage.set('iptv_pilot_book',book)
        }
        else return book[param_name]
    }
}

export default Pilot