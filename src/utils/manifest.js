let object = {
    author: 'Yumata',
    github: 'https://github.com/yumata/lampa-source',
    css_version: '2.4.4',
    app_version: '1.9.3',
    cub_domain: 'cub.watch'
}

let plugins = []

Object.defineProperty(object, 'app_digital', { get: ()=> parseInt(object.app_version.replace(/\./g,'')) })
Object.defineProperty(object, 'css_digital', { get: ()=> parseInt(object.css_version.replace(/\./g,'')) })

Object.defineProperty(object, 'plugins', { 
    get: ()=> plugins,
    set: (plugin)=> {
        if(typeof plugin == 'object' && typeof plugin.type == 'string'){
            plugins.push(plugin)
        }
    }
})

export default object