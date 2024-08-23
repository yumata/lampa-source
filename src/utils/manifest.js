let object = {
    author: 'Yumata',
    github: 'https://github.com/yumata/lampa-source',
    css_version: '2.8.1',
    app_version: '2.1.1',
    cub_domain: 'cub.red'
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