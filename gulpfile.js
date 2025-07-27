import { src, dest, series, parallel, watch } from 'gulp';
import uglifycss from 'gulp-uglifycss';
import browserSync from 'browser-sync';
import newer from 'gulp-newer';
import gulpSass from 'gulp-sass'
import * as dartSass from 'sass'
import autoprefixer from 'gulp-autoprefixer';
import fileinclude from 'gulp-file-include';
import replace from 'gulp-replace';
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import path from 'path'
import worker from 'rollup-plugin-web-worker-loader';
import { createHash } from 'crypto';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import rollup from '@rollup/stream';
import { join } from 'path';
import { parse } from 'doctrine';
import esbuild from 'rollup-plugin-esbuild';
import gulpTerser from 'gulp-terser';
import imagemin from 'gulp-imagemin';
import commonjs from '@rollup/plugin-commonjs'; // Add support for require() syntax
import nodeResolve from '@rollup/plugin-node-resolve'; // Add support for importing from node_modules folder like import x from 'module-name'
import plumber from 'gulp-plumber'; // Add support for error handling
import gulpIf from 'gulp-if';
import rename from 'gulp-rename';

/** Custom error handler */
function handleError(error) {
    const msg = error?.message || error;
    const stack = error?.stack || '';
    console.error('❌ Gulp error:', msg);
    if (stack && stack !== msg) 
        console.error(stack);
    this?.emit?.('end');
}

process.on('uncaughtException', error => {
    console.error('❌ Uncaught exception:', error?.stack || error);
    process.exit(1);
});

process.on('unhandledRejection', error => {
    console.error('❌ Unhandled rejection:', error?.stack || error);
    process.exit(1);
});

const browser = browserSync.create()
const sass = gulpSass(dartSass);

const options = {
    js: {
        uglify: {
            mangle: process.argv.includes('--uglifyJs'),
            keep_classnames: true,
            keep_fnames: true,
            output: {
                comments: false
            }
        },
        sourcemaps: process.argv.includes('--sourcemaps')
    },
    css: {
        uglify: process.argv.includes('--uglifyCss'),
        autoprefixer_options: ['last 100 versions', '> 1%', 'ie 8', 'ie 7', 'ios 6', 'android 4'],
    },
    platforms:[
        'web',
        'webos',
        'tizen',
        'github'
    ]
}

var srcFolder = './src/';
var pubFolder = './public/';
var idxFolder = './index/';
var plgFolder = './plugins/';

var bldFolder = './build/';

/** Build single app.js file */
function buildAppMinJs() {
      return prepareRollup(srcFolder, "app.js")
      .pipe(replace(/return kIsNodeJS/g, "return false"))
      .pipe(uglifyJs())
      .pipe(rename('app.min.js'))
      .pipe(dest(join(bldFolder)));
}

/** Prepare rollout */
function prepareRollup(inputFolder, fileName){
    return rollup({
        input: join(inputFolder, fileName),
        plugins: [
            esbuild({ target: 'es2017' }),
            commonjs, 
            nodeResolve,
            worker(),
        ],
        output: {
          format: 'iife',
          sourcemap: options.js.sourcemaps ? 'inline' : false,
        },
        onwarn: msg => {
          // console.warn(msg); TODO: temporary disable
        }
      })
      .pipe(source(fileName))
      .pipe(plumber({ errorHandler: handleError }))
      .pipe(buffer())
}

/** Gets file cache */
function getFileHash(filePath) {
    try {
        if (!existsSync(filePath)) {
            console.error(`❌ File not found: ${filePath}`);
            return null;
        }

        const fileBuffer = readFileSync(filePath);
        const hashSum = createHash('md5');
        hashSum.update(fileBuffer);
        return hashSum.digest('hex');
    } catch (error) {
        handleError(error);
        return null;
    }    
}

/** Build plugins */
function buildJsPlugins() {
    const directories = readdirSync(plgFolder)
        .filter(name => statSync(join(plgFolder, name)).isDirectory())

    const tasks = directories.map(folder => {
        return new Promise((resolve, reject) => {
            console.log(` 🧩 ${folder}`)
            prepareRollup(plgFolder, `${folder}/${folder}.js`)
            .pipe(uglifyJs())
            .pipe(fileinclude({
                prefix: '@@',
                basepath: '@file'
            }))
            .pipe(dest(join(bldFolder, 'plugins')))
            .on('end', resolve)
            .on('error', reject);        
        });
    });

    return Promise.all(tasks);
}

/** Copy plugins */
function copyPlugins(platform){
    const pluginsPath = join(bldFolder, 'plugins')
    const directories = readdirSync(pluginsPath)
        .filter(file => statSync(join(pluginsPath, file)).isDirectory());

    const tasks = directories.map(folder => {
        return new Promise((resolve, reject) => {
            console.log(` - ${folder}`)

            src([join(pluginsPath, folder, `${folder}.js`)])
            .pipe(plumber({ errorHandler: handleError }))
            .pipe(dest(join(bldFolder, platform, 'plugins')))
            .on('end', resolve)
            .on('error', reject);           
        })
    });

    return Promise.all(tasks);
}

/** Delete everything generated when building plugins */
function cleanupPlugins(done) {
    let count = 0;

    function clean(dir) {
        readdirSync(dir).forEach(item => {
            const path = join(dir, item);
            if (statSync(path).isDirectory()) {
                clean(path);
            } else if (item.endsWith('.css')) {
                try { 
                    console.info(` - ${path}`)
                    unlinkSync(path); 
                    count++; 
                } catch (error) {
                    handleError(error)
                }
            }
        });
    }
    
    clean(plgFolder);
    console.log(`♻️  Removed ${count} *.css files in ${plgFolder} folder`);

    done();
}

/** Build styles (base implementation) */
function buildStylesBase({ inputGlob, outputDir, runOoptions = {} }) {
    const {
        uglify = { 
            enabled: false ,
            options: {}
        },
        replaceNewlines = false,
        replaceQuotes = false
    } = runOoptions;
  
    return src(inputGlob)
      .pipe(plumber({ errorHandler: handleError }))
      .pipe(sass.sync().on('error', sass.logError)) // Convert Sass to CSS
      .pipe(autoprefixer({ overrideBrowserslist: options.css.autoprefixer_options, cascade: true }))
      .pipe(gulpIf(uglify.enabled, uglifycss(uglify.options)))
      .pipe(gulpIf(replaceNewlines, replace(/\n/g, '')))
      .pipe(gulpIf(replaceQuotes, replace(/"/g, "'")))
      .pipe(dest(outputDir))
}

/** Build platform styles */
function buildAppStyles() {
    return buildStylesBase({
      inputGlob: join(srcFolder, 'sass/*.scss'),
      outputDir: join(bldFolder),
      runOoptions: {
        uglify: { 
            enabled: options.css.uglify 
        }
      }
    });
}

/** Build plugin styles */
function buildPluginStyles() {
    return buildStylesBase({
        inputGlob: join(plgFolder, '**/*.scss'),
        outputDir: plgFolder,
        runOoptions: {
            replaceNewlines: true,
            replaceQuotes: true,
            uglify: {
                enabled: options.css.uglify,
                options: {
                    uglyComments: true,
                    maxLineLen: 120
                }
            }        
        }
    });
}

/** Copy app.min.js to platform folder */
function copyAppMinJs(platform){
    const path = join(bldFolder, 'app.min.js')
    return src(path)
        .pipe(plumber({ errorHandler: handleError }))
        .pipe(dest(join(bldFolder, platform)))
}

/** Copy app.css to platform folder */
function copyAppStyles(platform){
    const path = join(bldFolder, 'app.css')
    return src(path)
        .pipe(plumber({ errorHandler: handleError }))
        .pipe(dest(join(bldFolder, platform, 'css')))
}

/** Build manifest */
function buildManifest(done){
    try {
        var manifest = readFileSync(join(srcFolder, 'utils/manifest.js'), 'utf8')
        var hash     = getFileHash(join(bldFolder, 'github/app.min.js'))

        var app_version = manifest.match(/app_version: '(.*?)',/)[1]
        var css_version = manifest.match(/css_version: '(.*?)',/)[1]

        var manifestData = {
            app_version: app_version,
            css_version: css_version,
            css_digital: parseInt(css_version.replace(/\./g,'')),
            app_digital: parseInt(app_version.replace(/\./g,'')),
            time: Date.now(),
            hash: hash
        }

        console.log('✅ Assembly info:', manifestData)

        writeFileSync(join(bldFolder, 'github/assembly.json'), JSON.stringify(manifestData, null, 4))

        done();
    } catch (error) {
        handleError(error)
        done(error);
    }        
}

/** Copy languages into platform folder */
function copyLanguages(platform){
    return src(join(srcFolder, 'lang/*.js'))
        .pipe(plumber({ errorHandler: handleError }))
        .pipe(uglifyJs())
        .pipe(dest(join(bldFolder, platform, 'lang')))
}

/** Uglify js files if `options.js.uglify.mangle` is true */
function uglifyJs() {
    if (options.js.uglify.mangle){
        console.info(`  - uglify.`);
    }

    return gulpIf(options.js.uglify.mangle, gulpTerser(options.js.uglify));
}

/** Copy Static files */
function copyStatic(srcPath, platform){
    if(!existsSync(srcPath)){
        console.info(` - ℹ️  [skipped] not exists ${srcPath}`)
        return Promise.resolve()
    }

    const destPath = join(bldFolder, platform)
    return src(join(srcPath, '/**/*'), { encoding: false })
        .pipe(plumber({ errorHandler: handleError }))
        .pipe(newer(destPath))
        .pipe(imagemin( { silent: false }))
        .pipe(dest(destPath))
}

/** Watch mode **/
function watch_changes(done){
    // src
    const platform = 'web'
    watch('src/sass/*.scss', series(buildAppStyles, () => copyAppStyles(platform), reloadBrowser));
    watch(['src/**/*.js', '!src/lang/*.js'], series(buildAppMinJs, () => copyAppMinJs(platform), reloadBrowser));
    watch('src/lang/*.js', series(() => copyLanguages(platform), reloadBrowser));
    // plugins
    watch('plugins/**/*.js', series(build_plugins, () => copyPlugins(platform), reloadBrowser));
    watch('plugins/**/*.scss', series(build_plugins, () => copyPlugins(platform), reloadBrowser));

    done();
}

/** Browser sync */
function browser_syncup(done) {
    browser.init({
        server: {
            baseDir: join(bldFolder, 'web')
        },
        open: false,
        notify: false,
        ghostMode: false,
    });

    done();
}

/** Reload browser */
function reloadBrowser(done) {
    browser.reload();
    done();
}

/** Build documentation */
function buildDocumentation(done) {
    try {
        const data = []
        let scanned = 0

        console.log('🔎 Scanning documents:')

        function scan(directory){
            readdirSync(directory)
            .filter(file => path.extname(file) === '.js' || statSync(directory +'/' + file).isDirectory())
            .forEach(file => {
                const filePath = join(directory, file)
                const stat = statSync(filePath)

                if (stat.isDirectory()){ 
                    scan(filePath)
                } else {
                    scanned++
                    const code = readFileSync(filePath, 'utf8') + ''

                    const comments = code.match(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm)

                    if (!comments){
                        return;
                    }
                    console.log(` - ${filePath}`)

                    comments.forEach(comment => {
                        try {
                            const parsedComment = parse(comment, { unwrap: true });

                            if (!parsedComment.tags.find(t => t.title === 'doc')) 
                                return;

                            const params = parsedComment.tags.filter(t => ['doc', 'name', 'alias'].indexOf(t.title) == -1)
                            const category = parsedComment.tags.find(t => t.title == 'alias')
                            const name = parsedComment.tags.find(t => t.title == 'name')
                            
                            data.push({
                                file: filePath,
                                params: params.map(p => ({param: p.name || p.title, desc: p.description || '', type: p.type ? p.type.name : 'any'})),
                                desc: parsedComment.description,
                                category: category ? category.name : 'other',
                                name: name ? name.name : 'unknown'
                            })
                        } catch (parseError) {
                            console.warn(`Error parsing comment in ${filePath}:`, parseError.message);
                        }                        
                    })
                }
            })
        }
        
        scan(srcFolder)

        const docTemplate = readFileSync(idxFolder+'doc/index.html', 'utf8')
        const docHtml = docTemplate.replace('{data}', JSON.stringify(data))

        writeFileSync(join('build/doc','data.json'), JSON.stringify(data))
        writeFileSync(join('build/doc','index.html'), docHtml)
        
        console.log(`✅ Documentation built with ${data.length}/${scanned} entries`);
        done()
    } catch (error) {
        console.error('❌ Error building documentation:', error.message);
        done(error);
    }
}

/** Create named task */
function run(name, fn) {
    Object.defineProperty(fn, 'name', { value: name });
    return fn;
}

/** Create platform build */
function createPlatformBuild(platform) {
    return series(
        parallel(
            run(` - copy languages`, () => copyLanguages(platform)),
            run(` - copy [public]`,  () => copyStatic(pubFolder, platform)),
            run(` - copy [index]`,   () => copyStatic(join(idxFolder, platform), platform))
        ),
        run(` - copy ./app.min.js`, () => copyAppMinJs(platform)),
        run(` - copy ./app.css`,    () => copyAppStyles(platform))
    );
}

/** Build application for all platform */
function buildAllApp() {
    const tasks = options.platforms.map(platform => {
        return createPlatformBuild(platform);
    });

    return series(parallel(buildAppMinJs, buildAppStyles), ...tasks, doc, build_plugins, run(' - copy [plygins]', () => copyPlugins('web')));
}

// build documentation
export const doc             = series(run(` - copy [doc]`, () => copyStatic(join(idxFolder, 'doc'), 'doc')), buildDocumentation)

// build packages
export const build_webos     = series(parallel(buildAppMinJs, buildAppStyles), createPlatformBuild('webos'));
export const build_tizen     = series(parallel(buildAppMinJs, buildAppStyles), createPlatformBuild('tizen'));
export const build_github    = series(parallel(buildAppMinJs, buildAppStyles), createPlatformBuild('github'), buildManifest);

export const build_plugins   = series(buildPluginStyles, buildJsPlugins, cleanupPlugins);
export const build_web       = series(parallel(buildAppMinJs, buildAppStyles), createPlatformBuild('web'), build_plugins, run(' - copy [plygins]', () => copyPlugins('web')));

export const build_all       = buildAllApp();

// debug
export const debug           = series(build_web, parallel(watch_changes, browser_syncup));
export default debug