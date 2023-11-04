import DB from './db'

let Cache = new DB('cache',[
    'screensavers',
    'plugins',
    'backgrounds',
    'images',
    'themes',
    'other',
    'timetable'
],5)

Cache.openDatabase()

export default Cache