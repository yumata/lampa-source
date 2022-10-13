let object = {
    author: 'Yumata',
    github: 'https://github.com/yumata/lampa-source',
    css_version: '1.7.8',
    app_version: '1.5.4',
}

Object.defineProperty(object, 'app_digital', { get: ()=> parseInt(object.app_version.replace(/\./g,'')) })
Object.defineProperty(object, 'css_digital', { get: ()=> parseInt(object.css_version.replace(/\./g,'')) })

export default object