let last_query = ''

class Search{
    static find(channels, call){
        let controller = Lampa.Controller.enabled().name

        Lampa.Input.edit({
            value: last_query,
            free: true,
            nosave: true
        },(new_value)=>{
            last_query = new_value

            Lampa.Controller.toggle(controller)

            call({
                channels: channels.filter(c=>c.name.toLowerCase().indexOf(new_value.toLowerCase()) >= 0),
                query: new_value
            })
        })
    }
}

export default Search