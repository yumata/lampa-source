/**
 * Сервис для тестирования и отладки приложения.
 */

function init(){
    if(window.location.href.indexOf('localhost') == -1) return

    setTimeout(()=>{
        let playlist = [
            {
                title: 'Супер марио',
                url: './img/Big_Buck_Bunny_720_10s_5MB.mp4',
                subtitle: 'Серия 1'
            },
            {
                title: 'Как я переделал плеер',
                url: './img/Big_Buck_Bunny_720_10s_5MB2.mp4',
                subtitle: 'Серия 2',
                thumbnail: 'http://image.tmdb.org/t/p/w300/zcHGfm8LLtEsAwgV7kc7s0bskO5.jpg?email=yumata%40gmail.com'
            }
        ]


        Lampa.Player.play({
            title: 'Эпизод 2', 
            url: './img/Big_Buck_Bunny_720_10s_5MB.mp4',
            playlist,
            segments: {
                skip: [
                    {
                        start: 4,
                        end: 6
                    }
                ]
            }
        })

        Lampa.Player.playlist(playlist)
    }, 1500)
}

export default {
    init
}