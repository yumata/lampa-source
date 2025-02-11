console.log('Start load');

var domain = 'yumata.github.io/lampa/';

function createScript(src,error){
    console.log('Load script:' + src);
    
    var script         = document.createElement('script');
        script.onerror = error;
        script.src     = src;
        script.type    = 'text/javascript';
    
    document.getElementsByTagName("body")[0].appendChild(script);
}

function startAppWithDeepLink(){
    createScript('https://'+domain+'/app.min.js?v' + Math.random(), function(){
        console.log('Protocol https fail');
        
        createScript('http://'+domain+'/app.min.js?v' + Math.random(), function(){
            console.log('Protocol http fail');
            
            loadFromLocal()
        })
    })
}

function saveToLocal(){
    var request = new XMLHttpRequest();

    request.onload = function() {
        if (this.readyState == 4 && this.status == 200) {
            window.localStorage.setItem('app.js',this.responseText)

            console.log('Saved in storage')
        }
    };

    request.onerror = function () {
        
    };

    request.open('GET', 'http://'+domain+'/app.min.js?v' + Math.random());
    request.send();
}

function loadFromLocal(){
    var app = window.localStorage.getItem('app.js')

    if(app){
        console.log('Try eval app')

        eval(app)
    }
    else{
        createScript('app.min.js', function(){
            console.log('Load local script');
        })
    }
}

var timeLeft = 15;
var timerId  = setInterval(countdown, 1000);

function checkConnection(url, successCb, errorCb) {
    var xhr = new XMLHttpRequest();
    var executed = false;

    xhr.open('GET', url, true);
    xhr.timeout = 1000;
    xhr.onload = function () {
        if (executed) {
            return;
        }
        executed = true;
        if (xhr.status == '200') {
            successCb && successCb(xhr);
        } else {
            errorCb && errorCb(xhr);
        }
    };
    xhr.onerror = function () {
        if (executed) {
            return;
        }
        executed = true;
        errorCb && errorCb(xhr);
    };
    xhr.ontimeout = function () {
        if (executed) {
            return;
        }
        executed = true;
        errorCb && errorCb(xhr);
    };
    xhr.send(null); 
}


function countdown() {
    if (timeLeft == 0) {
        clearTimeout(timerId);

        startAppWithDeepLink();

        saveToLocal();
    } else {
        checkConnection(
            'http://'+domain+'/app.min.js?v' + Math.random(),
            function () {
                clearTimeout(timerId);

                startAppWithDeepLink();

                saveToLocal();
            },
            function () {
                console.log('No Network');
            });
    }

    timeLeft--;
}

countdown();