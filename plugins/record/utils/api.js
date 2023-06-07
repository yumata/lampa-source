class Api{
    static network = new Lampa.Reguest()
    static api_url = 'https://www.radiorecord.ru/api/stations/'

    static list(){
        return new Promise((resolve, reject)=>{
            this.network.silent(this.api_url,(result)=>{
                Lampa.Cache.rewriteData('other', 'radio_record_list',result).finally(resolve.bind(resolve,result))
            },()=>{
                Lampa.Cache.getData('other', 'radio_record_list').then(resolve).catch(reject)
            })
        })
    }
}

export default Api