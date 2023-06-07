import DB from './db'

let Cache = new DB('cache',[
    'screensavers',
    'plugins',
    'backgrounds',
    'images',
    'themes',
    'other'
],4)

Cache.openDatabase()

export default Cache