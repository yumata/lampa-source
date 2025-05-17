import DB from './db'

let Cache = new DB('cache',[
    'screensavers',
    'plugins',
    'backgrounds',
    'images',
    'themes',
    'other',
    'timetable',
    'cards',
    'storage'
],7)

Cache.openDatabase().then(()=>{
    console.log('Cache', 'worked')
}).catch(()=>{
    console.log('Cache', 'error', 'no open database')
})

export default Cache