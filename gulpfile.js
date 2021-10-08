/** Что-бы все не пропало! **/
process.on('uncaughtException', function (err) {
    console.log(err)
});



//node 10.2.0

var gulp           = require('gulp'),
	concat         = require('gulp-concat'),
	del            = require('del'),
	chokidar       = require('chokidar'),
	uglify         = require('gulp-uglify-es').default,
    browser        = require('browser-sync').create(),
    sequence       = require('run-sequence'),
    newer          = require('gulp-newer'),
    sass           = require('gulp-sass'),
    autoprefixer   = require('gulp-autoprefixer');


var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var rollup = require('@rollup/stream');

// *Optional* Depends on what JS features you want vs what browsers you need to support
// *Not needed* for basic ES6 module import syntax support
var babel = require('@rollup/plugin-babel').babel;
// Add support for require() syntax
var commonjs = require('@rollup/plugin-commonjs');
// Add support for importing from node_modules folder like import x from 'module-name'
var nodeResolve = require('@rollup/plugin-node-resolve');

var uglify  = require('gulp-uglify-es').default;

var cache;

var srcFolder = './src/';
var dstFolder = './dest/';
var pubFolder = './public/';
var bulFolder = './build/';
var idxFolder = './index/';


gulp.task('merge', function() {
    let plugins = [babel({
        presets: ['@babel/preset-env']
    }), commonjs, nodeResolve]

    rollup({
        // Point to the entry file
        input: srcFolder+"app.js",
  
        // Apply plugins
        plugins: plugins,
  
        // Use cache for better performance
        cache: cache,
  
        // Note: these options are placed at the root level in older versions of Rollup
        output: {
          // Output bundle is intended for use in browsers
          // (iife = "Immediately Invoked Function Expression")
          format: 'iife',
        }
      })
      .on('bundle', function(bundle) {
        // Update cache data after every bundle is created
        cache = bundle;
      })
      
      // Name of the output file.
      .pipe(source('app.js'))
      .pipe(buffer())
      //.pipe(uglify())
      // Where to send the output file
      .pipe(gulp.dest(dstFolder));
});

var copy_timer;

/** Обновляем файл для WEB **/
gulp.task('build_web', function(){
    clearTimeout(copy_timer)
    
    //таймер сила!
    copy_timer = setTimeout(()=>{
        gulp.src([dstFolder+'app.js']).pipe(gulp.dest(bulFolder+'web/'));
    },500)
});

/** Публикуем для WEB платформы **/
gulp.task('public_webos', function(){
    return gulp.src(dstFolder + '/app.min.js').pipe(gulp.dest(bulFolder+'webos/'));
});

gulp.task('public_tizen', function(){
    return gulp.src(dstFolder + '/app.min.js').pipe(gulp.dest(bulFolder+'tizen/'));
});

gulp.task('public_github', function(){
    return gulp.src(dstFolder + '/app.min.js').pipe(gulp.dest(bulFolder+'github/lampa/'));
});

gulp.task('index_webos', function(){
    return gulp.src(idxFolder + '/webos/**/*').pipe(gulp.dest(bulFolder+'webos/'));
});

gulp.task('index_tizen', function(){
    return gulp.src(idxFolder + '/tizen/**/*').pipe(gulp.dest(bulFolder+'tizen/'));
});

gulp.task('index_github', function(){
    return gulp.src(idxFolder + '/github/**/*').pipe(gulp.dest(bulFolder+'github/lampa/'));
});

/** Сверяем файлы **/
gulp.task('sync_web', function(){
    return gulp.src([pubFolder+'**/*'])
        .pipe(newer(bulFolder+'web/'))
        .pipe(gulp.dest(bulFolder+'web/'));
});

/** Сверяем файлы **/
gulp.task('sync_webos', function(){
    return gulp.src([pubFolder+'**/*'])
        .pipe(newer(bulFolder+'webos/'))
        .pipe(gulp.dest(bulFolder+'webos/'));
});

gulp.task('sync_tizen', function(){
    return gulp.src([pubFolder+'**/*'])
        .pipe(newer(bulFolder+'tizen/'))
        .pipe(gulp.dest(bulFolder+'tizen/'));
});

gulp.task('sync_github', function(){
    return gulp.src([pubFolder+'**/*'])
        .pipe(newer(bulFolder+'github/lampa/'))
        .pipe(gulp.dest(bulFolder+'github/lampa/'));
});

/** Следим за изменениями в файлах **/
gulp.task('watch', function(){
	var watcher = chokidar.watch([srcFolder,pubFolder], { persistent: true});

    var timer;
    var change = function(path){
        clearTimeout(timer)

        if(path.indexOf('app.css') > -1) return;

        timer = setTimeout(function(){
            sequence('merge','sass','sync_web','build_web');
        },100)
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
});

gulp.task('browser-sync', function() {
    browser.init({
        server: {
            baseDir: bulFolder+'web/'
        },
        open: false,
		notify: false
    });
});

gulp.task('sass', function(){
	return gulp.src(srcFolder+'/sass/*.scss')
		.pipe(sass().on('error', sass.logError)) // Преобразуем Sass в CSS посредством gulp-sass
		.pipe(autoprefixer(['last 100 versions', '> 1%', 'ie 8', 'ie 7', 'ios 6', 'android 4'], { cascade: true })) // Создаем префиксы
		.pipe(gulp.dest(pubFolder+'/css'))
		.pipe(browser.reload({stream: true}))
});

gulp.task('uglify', function() {
    return gulp.src([dstFolder+'app.js']).pipe(uglify()).pipe(concat('app.min.js')).pipe(gulp.dest(dstFolder));
});

gulp.task('pack_webos', function() {
    sequence('sync_webos','uglify','public_webos','index_webos');
});

gulp.task('pack_tizen', function() {
    sequence('sync_tizen','uglify','public_tizen','index_tizen');
});

gulp.task('pack_github', function() {
    sequence('sync_github','uglify','public_github','index_github');
});

gulp.task('default', ['watch','browser-sync']);