/**
 * Сервис для тестирования и отладки приложения.
 */

function init(){
    if(window.location.href.indexOf('localhost') == -1) return

    setTimeout(()=>{
        let subtitles = [
            {
                url: './test/subs.vtt',
                lang: 'ru',
                label: 'Русский'
            }
        ]

        let playlist = [
            {
                title: 'Супер марио',
                url: './test/video.mp4',
                subtitle: 'Серия 1',
                subtitles
            },
            {
                title: 'Как я переделал плеер',
                url: './test/video2.mp4',
                subtitle: 'Серия 2',
                thumbnail: 'http://image.tmdb.org/t/p/w300/zcHGfm8LLtEsAwgV7kc7s0bskO5.jpg',
                subtitles
            }
        ]


        Lampa.Player.play({
            title: 'Живая ярость', 
            url: playlist[0].url,
            playlist,
            subtitles,
            quality: {
                '720p': playlist[0].url,
                '1080p': playlist[0].url
            },
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
    }, 3500)
}

export default {
    init
}