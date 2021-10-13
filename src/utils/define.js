if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(target, firstSource) {
            'use strict';
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert first argument to object');
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) {
                    continue;
                }

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        }
    });
}

if (!Array.from) {
    Array.from = (function() {
        var toStr = Object.prototype.toString;
        var isCallable = function(fn) {
        return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
        };
        var toInteger = function (value) {
        var number = Number(value);
        if (isNaN(number)) { return 0; }
        if (number === 0 || !isFinite(number)) { return number; }
        return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function (value) {
        var len = toInteger(value);
        return Math.min(Math.max(len, 0), maxSafeInteger);
        };
    
        // Свойство length метода from равно 1.
        return function from(arrayLike/*, mapFn, thisArg */) {
        // 1. Положим C равным значению this.
        var C = this;
    
        // 2. Положим items равным ToObject(arrayLike).
        var items = Object(arrayLike);
    
        // 3. ReturnIfAbrupt(items).
        if (arrayLike == null) {
            throw new TypeError('Array.from requires an array-like object - not null or undefined');
        }
    
        // 4. Если mapfn равен undefined, положим mapping равным false.
        var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
        var T;
        if (typeof mapFn !== 'undefined') {
            // 5. иначе
            // 5. a. Если вызов IsCallable(mapfn) равен false, выкидываем исключение TypeError.
            if (!isCallable(mapFn)) {
            throw new TypeError('Array.from: when provided, the second argument must be a function');
            }
    
            // 5. b. Если thisArg присутствует, положим T равным thisArg; иначе положим T равным undefined.
            if (arguments.length > 2) {
            T = arguments[2];
            }
        }
    
        // 10. Положим lenValue равным Get(items, "length").
        // 11. Положим len равным ToLength(lenValue).
        var len = toLength(items.length);
    
        // 13. Если IsConstructor(C) равен true, то
        // 13. a. Положим A равным результату вызова внутреннего метода [[Construct]]
        //     объекта C со списком аргументов, содержащим единственный элемент len.
        // 14. a. Иначе, положим A равным ArrayCreate(len).
        var A = isCallable(C) ? Object(new C(len)) : new Array(len);
    
        // 16. Положим k равным 0.
        var k = 0;
        // 17. Пока k < len, будем повторять... (шаги с a по h)
        var kValue;
        while (k < len) {
            kValue = items[k];
            if (mapFn) {
            A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
            } else {
            A[k] = kValue;
            }
            k += 1;
        }
        // 18. Положим putStatus равным Put(A, "length", len, true).
        A.length = len;
        // 20. Вернём A.
        return A;
        };
    }());
}

if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
        value: function(predicate) {
        // 1. Let O be ? ToObject(this value).
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }
    
        var o = Object(this);
    
        // 2. Let len be ? ToLength(? Get(O, "length")).
        var len = o.length >>> 0;
    
        // 3. If IsCallable(predicate) is false, throw a TypeError exception.
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
    
        // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
        var thisArg = arguments[1];
    
        // 5. Let k be 0.
        var k = 0;
    
        // 6. Repeat, while k < len
        while (k < len) {
            // a. Let Pk be ! ToString(k).
            // b. Let kValue be ? Get(O, Pk).
            // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
            // d. If testResult is true, return kValue.
            var kValue = o[k];
            if (predicate.call(thisArg, kValue, k, o)) {
            return kValue;
            }
            // e. Increase k by 1.
            k++;
        }
    
        // 7. Return undefined.
        return undefined;
        },
        configurable: true,
        writable: true
    });
}

if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
        'use strict';
        if (typeof start !== 'number') {
        start = 0;
        }
    
        if (start + search.length > this.length) {
        return false;
        } else {
        return this.indexOf(search, start) !== -1;
        }
    };
}


export default {}