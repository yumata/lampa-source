import DB from './db'

let Cache = new DB('cache',[
    'screensavers',
    'plugins',
    'backgrounds',
    'images',
    'themes',
])

Cache.openDatabase()

export default Cache