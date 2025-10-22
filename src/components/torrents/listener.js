import Subscribe from '../../utils/subscribe'

function Listener(movie){
    let _self = this

    function start(e){
        if(e.type == 'list_open'){
            Lampa.Listener.follow('torrent_file', open)
        }

        if(e.type == 'list_close'){
            Lampa.Listener.remove('torrent_file', open)
        }
    }

    function open(e){
        if(e.type == 'onenter'){
            let open_movie = e.params.movie || {}

            if(open_movie.id == movie.id) _self.listener.send('open', e)
        }
    }

    this.listener = Subscribe()

    this.destroy = function(){
        Lampa.Listener.remove('torrent_file', start)
        Lampa.Listener.remove('torrent_file', open)
    }

    Lampa.Listener.follow('torrent_file', start)
}

export default Listener