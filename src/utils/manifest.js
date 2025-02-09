let object = {
    author: 'Yumata',
    github: 'https://github.com/yumata/lampa-source',
    github_lampa: 'https://yumata.github.io/lampa/',
    css_version: '2.6.3',
    app_version: '2.3.0',
    cub_mirrors: ['cub.red', 'standby.cub.red', 'kurwa-bober.ninja']
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

Object.defineProperty(object, 'cub_domain', { 
    get: ()=> {
        let use = localStorage.getItem('cub_domain') || ''

        return object.cub_mirrors.indexOf(use) > -1 ? use : object.cub_mirrors[0]
    } 
})

export default object