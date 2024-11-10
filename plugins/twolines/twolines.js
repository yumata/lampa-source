function init(){
    $('body').append(`
        <style>
        @@include('../plugins/twolines/css/style.css')
        </style>
    `)
}

if(window.appready) init()
else{
    Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') init()
    })
}