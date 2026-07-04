/**
 * Сервис для тестирования и отладки приложения.
 */

function init(){
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
                subtitle: 'Серия 2'
            }
        ]


        Lampa.Player.play({
            title: 'Преимущество при рождении', 
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