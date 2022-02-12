function toObject(a){
    if(Object.prototype.toString.call( a ) === '[object Object]') return a;
    else{
        a = {};
        
        return a;
    }
}
function toArray(a){
    if(Object.prototype.toString.call( a ) === '[object Object]'){
        var b = [];
        
        for(var i in a) b.push(a[i]);
        
        return b;
    }
    else if(typeof a == 'string' || a == null || typeof a == 'number' || typeof a == 'undefined') return [];
    else return a;
}
function decodeJson(string, empty){
    var json = empty || {};
    
    if(string){
        try{
            json = JSON.parse(string);
        }
        catch(e){
            
        }
    }
    
    return json;
}
function isObject(a){
    return Object.prototype.toString.call( a ) === '[object Object]';
}
function isArray(a){
    return Object.prototype.toString.call( a ) === '[object Array]';
}

function extend(a,b,replase){
    for(var i in b){
        if(typeof b[i] == 'object'){
            if(a[i] == undefined) a[i] = Object.prototype.toString.call( b[i] ) == '[object Array]' ? [] : {};
            
            this.extend(a[i],b[i],replase);
        } 
        else if(a[i] == undefined || replase) a[i] = b[i];
    }
}

function empty(a, b){
    for(var i in b){
        if(!a[i]) a[i] = b[i];
    }
}

function getKeys(a,add){
    var k = add || [];
    
    for(var i in a) k.push(i);
    
    return k;
}
function getValues(a,add){
    var k = add || [];
    
    for(var i in a) k.push(a[i]);
    
    return k;
}

function remove(from, need){
    var inx = from.indexOf( need )
    
    if(inx >= 0) from.splice( inx, 1 )
}

function clone(a){
    return JSON.parse(JSON.stringify(a))
}

function insert(where, index, item){
    where.splice( index, 0, item )
}

function destroy(arr, call_function = 'destroy', value = ''){
    var where = toArray(arr)
    
    for(var i = where.length - 1; i >= 0; i--) {
        if(where[i] && where[i][call_function]) where[i][call_function](value)
    }
}


function groupBy(xs, key) {
    return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x)
        return rv
    }, {})
}

function removeNoIncludes(where, items){
    for(var i = where.length - 1; i >= 0; i--) {
        if(items.indexOf(where[i]) === -1) remove(where, where[i])
    }

    return where
}

function shuffle(array){
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

export default {
    toObject,
    toArray,
    decodeJson,
    isObject,
    isArray,
    extend,
    getKeys,
    getValues,
    insert,
    clone,
    remove,
    destroy,
    empty,
    groupBy,
    removeNoIncludes,
    shuffle
}