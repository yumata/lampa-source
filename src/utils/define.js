if (!Object.assign) {
    Object
        .defineProperty(
            Object,
            'assign', {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function (target, firstSource) {
                'use strict';
                if (target === undefined || target === null) {
                    throw new TypeError(
                        'Cannot convert first argument to object');
                }

                var to = Object(target);
                for (var i = 1; i < arguments.length; i++) {
                    var nextSource = arguments[i];
                    if (nextSource === undefined
                        || nextSource === null) {
                        continue;
                    }

                    var keysArray = Object.keys(Object(nextSource));
                    for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                        var nextKey = keysArray[nextIndex];
                        var desc = Object.getOwnPropertyDescriptor(
                            nextSource, nextKey);
                        if (desc !== undefined && desc.enumerable) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
                return to;
            }
        });
}
if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function () {
        if(this.parentNode) this.parentNode.removeChild(this);
    };
}
if (!Math.trunc) {
	Math.trunc = function(v) {
		v = +v;
		return (v - v % 1)   ||   (!isFinite(v) || v === 0 ? v : v < 0 ? -0 : 0);
	};
}
if (!Array.from) {
    Array.from = (function () {
        var toStr = Object.prototype.toString;
        var isCallable = function (fn) {
            return typeof fn === 'function'
                || toStr.call(fn) === '[object Function]';
        };
        var toInteger = function (value) {
            var number = Number(value);
            if (isNaN(number)) {
                return 0;
            }
            if (number === 0 || !isFinite(number)) {
                return number;
            }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function (value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
        };

        // Свойство length метода from равно 1.
        return function from(arrayLike /* , mapFn, thisArg */) {
            // 1. Положим C равным значению this.
            var C = this;

            // 2. Положим items равным ToObject(arrayLike).
            var items = Object(arrayLike);

            // 3. ReturnIfAbrupt(items).
            if (arrayLike == null) {
                throw new TypeError(
                    'Array.from requires an array-like object - not null or undefined');
            }

            // 4. Если mapfn равен undefined, положим mapping равным false.
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== 'undefined') {
                // 5. иначе
                // 5. a. Если вызов IsCallable(mapfn) равен false, выкидываем
                // исключение TypeError.
                if (!isCallable(mapFn)) {
                    throw new TypeError(
                        'Array.from: when provided, the second argument must be a function');
                }

                // 5. b. Если thisArg присутствует, положим T равным thisArg;
                // иначе положим T равным undefined.
                if (arguments.length > 2) {
                    T = arguments[2];
                }
            }

            // 10. Положим lenValue равным Get(items, "length").
            // 11. Положим len равным ToLength(lenValue).
            var len = toLength(items.length);

            // 13. Если IsConstructor(C) равен true, то
            // 13. a. Положим A равным результату вызова внутреннего метода
            // [[Construct]]
            // объекта C со списком аргументов, содержащим единственный элемент
            // len.
            // 14. a. Иначе, положим A равным ArrayCreate(len).
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);

            // 16. Положим k равным 0.
            var k = 0;
            // 17. Пока k < len, будем повторять... (шаги с a по h)
            var kValue;
            while (k < len) {
                kValue = items[k];
                if (mapFn) {
                    A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn
                        .call(T, kValue, k);
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
    }
        ());
}
// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
        value: function (predicate) {
            // 1. Let O be ? ToObject(this value).
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If IsCallable(predicate) is false, throw a TypeError
            // exception.
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }

            // 4. If thisArg was supplied, let T be thisArg; else let T be
            // undefined.
            var thisArg = arguments[1];

            // 5. Let k be 0.
            var k = 0;

            // 6. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ! ToString(k).
                // b. Let kValue be ? Get(O, Pk).
                // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue,
                // k, O »)).
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
// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        value: function (searchElement, fromIndex) {

            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            // 1. Let O be ? ToObject(this value).
            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If len is 0, return false.
            if (len === 0) {
                return false;
            }

            // 4. Let n be ? ToInteger(fromIndex).
            // (If fromIndex is undefined, this step produces the value 0.)
            var n = fromIndex | 0;

            // 5. If n ≥ 0, then
            // a. Let k be n.
            // 6. Else n < 0,
            // a. Let k be len + n.
            // b. If k < 0, let k be 0.
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            function sameValueZero(x, y) {
                return x === y
                    || (typeof x === 'number' && typeof y === 'number'
                        && isNaN(x) && isNaN(y));
            }

            // 7. Repeat, while k < len
            while (k < len) {
                // a. Let elementK be the result of ? Get(O, ! ToString(k)).
                // b. If SameValueZero(searchElement, elementK) is true, return
                // true.
                if (sameValueZero(o[k], searchElement)) {
                    return true;
                }
                // c. Increase k by 1.
                k++;
            }

            // 8. Return false
            return false;
        }
    });
}
if (!String.prototype.includes) {
    String.prototype.includes = function (search, start) {
        'use strict';

        if (search instanceof RegExp) {
            throw TypeError('first argument must not be a RegExp');
        }
        if (start === undefined) {
            start = 0;
        }
        return this.indexOf(search, start) !== -1;
    };
}
if (!Object.entries){
    Object.entries = function (obj) {
        var ownProps = Object.keys(obj),
            i = ownProps.length,
            resArray = new Array(i); // preallocate the Array
        while (i--)
            resArray[i] = [ownProps[i], obj[ownProps[i]]];

        return resArray;
    };
}
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== 'function') {
            // ближайший аналог внутренней функции
            // IsCallable в ECMAScript 5
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () { },
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis
                    ? this
                    : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}
(function () {
    'use strict';
    var _slice = Array.prototype.slice;
  
    try {
      // Не может использоваться с элементами DOM в IE < 9
      _slice.call(document.documentElement);
    } catch (e) { // В IE < 9 кидается исключение
      // Функция будет работать для истинных массивов, массивоподобных объектов,
      // NamedNodeMap (атрибуты, сущности, примечания),
      // NodeList (например, getElementsByTagName), HTMLCollection (например, childNodes)
      // и не будет падать на других объектах DOM (как это происходит на элементах DOM в IE < 9)
      Array.prototype.slice = function(begin, end) {
        // IE < 9 будет недоволен аргументом end, равным undefined
        end = (typeof end !== 'undefined') ? end : this.length;
  
        // Для родных объектов Array мы используем родную функцию slice
        if (Object.prototype.toString.call(this) === '[object Array]') {
          return _slice.call(this, begin, end);
        }
  
        // Массивоподобные объекты мы обрабатываем самостоятельно
        var i, cloned = [],
            size, len = this.length;
  
        // Обрабатываем отрицательное значение begin
        var start = begin || 0;
        start = (start >= 0) ? start: len + start;
  
        // Обрабатываем отрицательное значение end
        var upTo = (end) ? end : len;
        if (end < 0) {
          upTo = len + end;
        }
  
        // Фактически ожидаемый размер среза
        size = upTo - start;
  
        if (size > 0) {
          cloned = new Array(size);
          if (this.charAt) {
            for (i = 0; i < size; i++) {
              cloned[i] = this.charAt(start + i);
            }
          } else {
            for (i = 0; i < size; i++) {
              cloned[i] = this[start + i];
            }
          }
        }
  
        return cloned;
      };
    }
  }());
