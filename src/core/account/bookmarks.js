import Favorite from '../favorite'
import Permit from './permit'
import Socket from '../socket'
import Api from './api'
import Arrays from '../../utils/arrays'
import Utils from '../../utils/utils'
import WebWorker from '../../utils/worker'
import Platform from '../platform'
import Listener from './listener'
import Storage from '../storage/storage'

let bookmarks = []

function init(){
    Favorite.listener.follow('add,added',(e)=>{
        save('add', e.where, e.card)
    })

    Favorite.listener.follow('remove',(e)=>{
        if(e.method == 'id') save('remove', e.where, e.card)
    })

    Storage.listener.follow('change',(e)=>{
        if(e.name == 'protocol') update()
    })
}

function save(method, type, card){
    if(Permit.sync){
        let find = bookmarks.find((elem)=>elem.card_id == card.id && elem.type == type)

        Api.load('bookmarks/' + method, {}, {
            type: type,
            data: JSON.stringify(Utils.clearCard(Arrays.clone(card))),
            card_id: card.id,
            id: find ? find.id : 0
        })

        if(method == 'remove'){
            if(find){
                Arrays.remove(bookmarks, find)
            } 
        }
        else{
            if(find) Arrays.remove(bookmarks, find)
            
            Arrays.insert(bookmarks,0,{
                id: find ? find.id : 0,
                cid: find ? find.cid : Permit.account.id,
                card_id: card.id,
                type: type,
                data: Utils.clearCard(Arrays.clone(card)),
                profile: Permit.account.profile.id,
                time: Date.now()
            })

            bookmarks.filter(elem=>elem.card_id == card.id).forEach((elem)=>{
                elem.time = Date.now()
            })

            bookmarks.sort((a,b)=>b.time - a.time)
        }

        updateChannels()

        Socket.send('bookmarks',{})
    }
}

function update(call){
    if(Permit.sync){
        Api.load('bookmarks/all?full=1', {dataType: 'text'}).then((result)=>{
            WebWorker.json({
                type: 'parse',
                data: result
            },(e)=>{
                updateBookmarks(e.data.bookmarks,()=>{
                    if(call && typeof call == 'function') call()
                })
            })
        }).catch(()=>{
            if(call && typeof call == 'function') call()
        })
    }
    else{
        updateBookmarks([], ()=>{
            if(call && typeof call == 'function') call()
        })
    }
}

function clear(where){
    if(Permit.sync){
        Api.load('bookmarks/clear', {}, {
            type: 'group',
            group: where
        }).then((result)=>{
            if(result.secuses) update()
        })
    }
}

function get(params){
    return bookmarks.filter(elem=>elem.type == params.type).map((elem)=>{
        return elem.data
    })
}

function all(){
    return bookmarks.map((elem)=>{
        return elem.data
    })
}

function updateChannels(){
    if(Platform.is('android') && typeof AndroidJS.saveBookmarks !== 'undefined' && bookmarks.length){
        WebWorker.json({
            type: 'stringify',
            data: bookmarks
        },(j)=>{
            AndroidJS.saveBookmarks(j.data)
        })
    }
}

function updateBookmarks(rows, call){
    WebWorker.utils({
        type: 'account_bookmarks_parse',
        data: rows
    },(e)=>{
        bookmarks = e.data

        bookmarks.forEach((elem)=>{
            elem.data = Utils.clearCard(elem.data)
        })

        updateChannels()

        if(call) call()
        
        Listener.send('update_bookmarks',{rows, bookmarks})
    })
}

function sync(callback){
    let file
    
    try{
        file = new File([localStorage.getItem('favorite') || '{}'], "bookmarks.json", {
            type: "text/plain",
        })
    }
    catch(e){}

    if(!file){
        try{
            file = new Blob([localStorage.getItem('favorite') || '{}'], {type: 'text/plain'})
            file.lastModifiedDate = new Date()
        }
        catch(e){
            Noty.show(Lang.translate('account_export_fail'))
        }
    }

    if(file){
        let formData = new FormData($('<form></form>')[0])
            formData.append("file", file, "bookmarks.json")
        
        setTimeout(()=>{
            callback && callback()
        }, 2000)

        // $.ajax({
        //     url: Api.url() + 'bookmarks/sync',
        //     type: 'POST',
        //     data: formData,
        //     async: true,
        //     cache: false,
        //     contentType: false,
        //     enctype: 'multipart/form-data',
        //     processData: false,
        //     headers: {
        //         token: Permit.token,
        //         profile: Permit.account.profile.id
        //     },
        //     success: function (j) {
        //         if(j.secuses){
        //             Noty.show(Lang.translate('account_sync_secuses'))

        //             update()
        //         }

        //         callback && callback()
        //     },
        //     error: function(){
        //         Noty.show(Lang.translate('account_export_fail'))

        //         callback && callback()
        //     }
        // })
    }
    else{
        callback && callback()
    }
}

export default {
    init,
    save,
    update,
    clear,
    get,
    all,
    sync
}