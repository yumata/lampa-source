/** Что-бы все не пропало! **/
process.on('uncaughtException', function (err) {
    console.log(err)
});


const { src, dest, series, parallel } = require('gulp');

var concat          = require('gulp-concat'),
    chokidar        = require('chokidar'),
    webWorkerLoader = require('rollup-plugin-web-worker-loader'),
    terser          = require('@rollup/plugin-terser'),
    cleanCss        = require('gulp-clean-css'),
    browser         = require('browser-sync').create(),
    newer           = require('gulp-newer'),
    sass            = require('gulp-sass')(require('sass')),
    autoprefixer    = require('autoprefixer'),
    postcss         = require('gulp-postcss'),
    replace         = require('gulp-replace'),
    fs              = require('fs'),
    crypto          = require('crypto');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var rollup = require('rollup');
var path   = require('path');

var doctrine = require('doctrine');

// *Optional* Depends on what JS features you want vs what browsers you need to support
// *Not needed* for basic ES6 module import syntax support
var babel = require('@rollup/plugin-babel').babel;
// Add support for require() syntax
var commonjs = require('@rollup/plugin-commonjs');
// Add support for importing from node_modules folder like import x from 'module-name'
var nodeResolve = require('@rollup/plugin-node-resolve');


var cache;

var srcFolder = './src/';
var dstFolder = './dest/';
var pubFolder = './public/';
var bulFolder = './build/';
var idxFolder = './index/';
var plgFolder = './plugins/';
var docFolder = './build/doc/';

var isDebugEnabled = false;

/**
 * Создает бандл для основного приложения
 */
async function merge() {
    let plugins = [webWorkerLoader(), babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env']
    }), commonjs(), nodeResolve(), terser()];

    const bundle = await rollup.rollup({
        input: srcFolder + "app.js",
        plugins: plugins,
        onwarn: function (message) {
            // Игнорируем предупреждения от Rollup, чтобы они не засоряли консоль
            return;
        }
    });

    await bundle.write({
        file: dstFolder + 'app.js',
        format: 'iife',
        sourcemap: isDebugEnabled ? 'inline' : false
    });
}

/**
 * Создает бандл для отдельного плагина
 */
async function bubbleFile(name) {
    let plug = [webWorkerLoader(), babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env']
    }), commonjs(), nodeResolve(), terser()];

    const bundle = await rollup.rollup({
        input: plgFolder + name,
        plugins: plug,
        onwarn: function (message) {
            return;
        }
    });

    await bundle.write({
        file: dstFolder + name,
        format: 'iife',
        sourcemap: isDebugEnabled ? 'inline' : false,
        sourcemapPathTransform: isDebugEnabled ? pluginSourcemapPathTransform : undefined
    });
}
function getFileHash(path) {
    const fileBuffer = fs.readFileSync(path);
    const hashSum = crypto.createHash('md5');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

function plugins(done) {
    fs.readdirSync(plgFolder).filter(function (file) {
        return fs.statSync(plgFolder+'/'+file).isDirectory();
    }).forEach(folder => {
        bubbleFile(folder+'/'+folder+'.js')

        plugin_sass(plgFolder+'/'+folder)
    });
      
    done();
}

function plugin_sass(plugin_src){
    return src(plugin_src+'/css/*.scss')
        .pipe(sass.sync({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(postcss([autoprefixer({overrideBrowserslist: ['last 100 versions', '> 1%', 'ie 8', 'ie 7', 'ios 6', 'android 4'],cascade: true})]))
        .pipe(cleanCss({compatibility: 'ie8'}))
        .pipe(replace(/\n/g, ''))
        .pipe(replace(/"/g, "'"))
        .pipe(dest(plugin_src+'/css'))
}

var copy_timer;

/** Обновляем файл для WEB **/
function build_web(done){
    clearTimeout(copy_timer)

    //таймер сила!
    copy_timer = setTimeout(()=>{
        src([dstFolder+'app.js']).pipe(dest(bulFolder+'web/'));

        fs.readdirSync(dstFolder).filter(function (file) {
            return fs.statSync(dstFolder+'/'+file).isDirectory();
        }).forEach(folder => {
            src([dstFolder+folder+'/'+folder+'.js']).pipe(dest(bulFolder+'web/plugins'));
        });
    },500)

    done();
}

function write_manifest(done){
    var manifest = fs.readFileSync(srcFolder+'utils/manifest.js', 'utf8')
    var hash     = getFileHash(dstFolder + '/app.min.js')

    var app_version = manifest.match(/app_version: '(.*?)',/)[1]
    var css_version = manifest.match(/css_version: '(.*?)',/)[1]

    var object = {
        app_version: app_version,
        css_version: css_version,
        css_digital: parseInt(css_version.replace(/\./g,'')),
        app_digital: parseInt(app_version.replace(/\./g,'')),
        time: Date.now(),
        hash: hash
    }

    console.log('assembly', object)

    fs.writeFileSync(idxFolder+'github/assembly.json', JSON.stringify(object, null, 4))

    done()
}

/** Публикуем для WEB платформы **/
function public_task(path){
    return src(dstFolder + '/app.min.js').pipe(dest(bulFolder+path));
}

function lang_task(){
    return src(srcFolder + '/lang/*.js').pipe(dest(pubFolder + '/lang'));
}

function public_webos(){
    return public_task('webos/');
}
function public_tizen(){
    return public_task('tizen/');
}
function public_github(){
    return public_task('github/lampa/');
}

function index_webos(){
    return src(idxFolder + '/webos/**/*').pipe(dest(bulFolder+'webos/'));
}
function index_tizen(){
    return src(idxFolder + '/tizen/**/*').pipe(dest(bulFolder+'tizen/'));
}
function index_github(){
    return src(idxFolder + '/github/**/*').pipe(dest(bulFolder+'github/lampa/'));
}

/** Сверяем файлы **/
function sync_task(path){
    return src([pubFolder + '**/*'])
        .pipe(newer(bulFolder+path))
        .pipe(dest(bulFolder+path));
}

function sync_web(){
    return sync_task('web/');
}
function sync_webos(){
    return sync_task('webos/');
}
function sync_tizen(){
    return sync_task('tizen/');
}
function sync_github(){
    return sync_task('github/lampa/');
}
function sync_doc(){
    return src([idxFolder + 'doc/' + '**/*'])
        .pipe(newer(docFolder))
        .pipe(dest(docFolder));
}

/** Следим за изменениями в файлах **/
function watch(done){
    var watcher = chokidar.watch([srcFolder,pubFolder,plgFolder], { persistent: true, ignored: [pubFolder + '/lang']});

    var timer;
    var change = function(path){
        clearTimeout(timer)

        if(path.indexOf('.css') > -1) return;

        timer = setTimeout(
            series(merge, plugins, sass_task, lang_task, sync_web, build_web)
        ,5000)
    }

    watcher.on('add', function(path) {
        console.log('File', path, 'has been added');

        change(path)
    })
    .on('change', function(path) {
        console.log('File', path, 'has been changed');

        change(path)
    })
    .on('unlink', function(path) {
        console.log('File', path, 'has been unlink');

        change(path)
    })

    done();
}

function browser_sync(done) {
    browser.init({
        server: {
            baseDir: bulFolder+'web/'
        },
        open: false,
        notify: false,
        ghostMode: false,
    });

    done();
}

function sass_task(){
    return src(srcFolder+'/sass/*.scss')
        .pipe(sass.sync({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(postcss([autoprefixer({overrideBrowserslist: ['last 100 versions', '> 1%', 'ie 8', 'ie 7', 'ios 6', 'android 4'],cascade: true})]))
        .pipe(dest(pubFolder+'/css'))
        .pipe(browser.reload({stream: true}))
}

function test(done){
    lang_task()
    done();
}

function enable_debug_mode(done){
    console.log("build with sourcemaps!")
    isDebugEnabled = true;
    done()
}

/**
 * преобразует путь к исходному файлу
 * @param {string} relativeSourcePath 
 * @param {string} sourcemapPath 
 * @returns {string} a new path to source
 */
function pluginSourcemapPathTransform(relativeSourcePath, sourcemapPath) {
    const plgFolderLen = plgFolder.length-2;
    const newPath = relativeSourcePath.substring(plgFolderLen);
    return newPath;
}

function buildDoc(done){
    let data = []

    function scan(directory){
        let files = fs.readdirSync(directory)

        files.forEach(file => {
            let filePath = path.join(directory, file)
            let stat = fs.statSync(filePath)

            if (stat.isDirectory()) scan(filePath)
            else{
                let code = fs.readFileSync(filePath, 'utf8') + ''

                console.log('scan', filePath)

                let comments = code.match(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm)

                if(comments){
                    comments.forEach(comment => {
                        let parsedComment = doctrine.parse(comment, { unwrap: true });

                        if(parsedComment.tags.find(t=>t.title == 'doc')){
                            let params = parsedComment.tags.filter(t=>['doc','name','alias'].indexOf(t.title) == -1)
                            let category = parsedComment.tags.find(t=>t.title == 'alias')
                            let name = parsedComment.tags.find(t=>t.title == 'name')
                            
                            //console.log(JSON.stringify(parsedComment.tags, null, 4))
                            
                            data.push({
                                file: filePath,
                                params: params.map(p=>({param: p.name || p.title, desc: p.description || '', type: p.type ? p.type.name : 'any'})),
                                desc: parsedComment.description,
                                category: category ? category.name : 'other',
                                name: name ? name.name : 'unknown'
                            })
                        }
                    })
                }
            }
        })
    }
    
    scan(srcFolder)

    let doc = fs.readFileSync(idxFolder+'doc/index.html', 'utf8')

    doc = doc.replace('{data}', JSON.stringify(data))

    fs.writeFileSync(docFolder+'data.json', JSON.stringify(data))
    fs.writeFileSync(docFolder+'index.html', doc)

    done()
}

exports.pack_webos   = series(sync_webos, public_webos, index_webos);
exports.pack_tizen   = series(sync_tizen, public_tizen, index_tizen);
exports.pack_github  = series(sync_github, public_github, write_manifest, index_github);
exports.pack_plugins = series(plugins);
exports.test         = series(test);
exports.default = parallel(watch, browser_sync);
exports.debug = series(enable_debug_mode, this.default)
exports.doc = series(sync_doc, buildDoc)
exports.write_manifest = series(write_manifest)
