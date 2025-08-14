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
if (!('find' in Element.prototype)) {
    Element.prototype.find = function (query) {
        return this.querySelector(query)
    };
}
if (!('text' in Element.prototype)) {
    Element.prototype.text = function (text) {
        this.innerText = text
        return this
    };
}
if (!('html' in Element.prototype)) {
    Element.prototype.html = function (html) {
        if(typeof html == 'string') this.innerHTML = html
        else{
            this.innerHTML = ''
            this.append(html)
        }
        return this
    };
}
if (!('removeClass' in Element.prototype)) {
    Element.prototype.removeClass = function (classes) {
        classes.split(' ').forEach(c=>{
            this.classList.remove(c)
        })
        return this
    };
}
if (!('addClass' in Element.prototype)) {
    Element.prototype.addClass = function (classes) {
        classes.split(' ').forEach(c=>{
            this.classList.add(c)
        })
        return this
    };
}
if (!('toggleClass' in Element.prototype)) {
    Element.prototype.toggleClass = function (classes, status) {
        classes.split(' ').forEach(c=>{
            let has = this.classList.contains(c)

            if(status && !has) this.classList.add(c)
            else if(!status && has) this.classList.remove(c)
        })
        return this
    };
}

if (!('empty' in Element.prototype)) {
    Element.prototype.empty = function () {
        this.innerHTML = ''
        return this
    };
}
//if (!('append' in Element.prototype)) {
    Element.prototype.append = function (child) {
        if(Object.prototype.toString.call(child) === '[object Array]'){
            child.forEach(c=>{
                this.appendChild(c instanceof jQuery ? c[0] : c)
            })
        }
        else this.appendChild(child instanceof jQuery ? child[0] : child)

        return this
    };
//}

Element.prototype.prepend = function (child) {
    if(Object.prototype.toString.call(child) === '[object Array]'){
        child.forEach(c=>{
            this.insertBefore(c instanceof jQuery ? c[0] : c, this.firstChild)
        })
    }
    else this.insertBefore(child instanceof jQuery ? child[0] : child, this.firstChild)
    
    return this
}

if (!('on' in Element.prototype)) {
    Element.prototype.on = function (on, call, options) {
        on.split(' ').forEach(e=>{
            this.addEventListener(e, call, options)
        })
        
        return this
    };
}

Number.prototype.pad = function(zeros) {
    var numberString = String(this);
    var zerosToAdd = zeros - numberString.length;
    var leadingZeros = "";

    for (var i = 0; i < zerosToAdd; i++) {
        leadingZeros += "0";
    }

    return leadingZeros + numberString;
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
 /*!
 * Shim for MutationObserver interface
 * Author: Graeme Yeates (github.com/megawac)
 * Repository: https://github.com/megawac/MutationObserver.js
 * License: WTFPL V2, 2004 (wtfpl.net).
 * Though credit and staring the repo will make me feel pretty, you can modify and redistribute as you please.
 * Attempts to follow spec (https://www.w3.org/TR/dom/#mutation-observers) as closely as possible for native javascript
 * See https://github.com/WebKit/webkit/blob/master/Source/WebCore/dom/MutationObserver.cpp for current webkit source c++ implementation
 */

/**
 * prefix bugs:
    - https://bugs.webkit.org/show_bug.cgi?id=85161
    - https://bugzilla.mozilla.org/show_bug.cgi?id=749920
 * Don't use WebKitMutationObserver as Safari (6.0.5-6.1) use a buggy implementation
*/
if (!window.MutationObserver) {
    window.MutationObserver = (function (undefined) {
        "use strict";
        /**
         * @param {function(Array.<MutationRecord>, MutationObserver)} listener
         * @constructor
         */
        function MutationObserver(listener) {
            /**
             * @type {Array.<Object>}
             * @private
             */
            this._watched = [];
            /** @private */
            this._listener = listener;
        }

        /**
         * Start a recursive timeout function to check all items being observed for mutations
         * @type {MutationObserver} observer
         * @private
         */
        function startMutationChecker(observer) {
            (function check() {
                var mutations = observer.takeRecords();

                if (mutations.length) { // fire away
                    // calling the listener with context is not spec but currently consistent with FF and WebKit
                    observer._listener(mutations, observer);
                }
                /** @private */
                observer._timeout = setTimeout(check, MutationObserver._period);
            })();
        }

        /**
         * Period to check for mutations (~32 times/sec)
         * @type {number}
         * @expose
         */
        MutationObserver._period = 30 /*ms+runtime*/;

        /**
         * Exposed API
         * @expose
         * @final
         */
        MutationObserver.prototype = {
            /**
             * see https://dom.spec.whatwg.org/#dom-mutationobserver-observe
             * not going to throw here but going to follow the current spec config sets
             * @param {Node|null} $target
             * @param {Object|null} config : MutationObserverInit configuration dictionary
             * @expose
             * @return undefined
             */
            observe: function ($target, config) {
                /**
                 * Using slightly different names so closure can go ham
                 * @type {!Object} : A custom mutation config
                 */
                var settings = {
                    attr: !!(config.attributes || config.attributeFilter || config.attributeOldValue),

                    // some browsers enforce that subtree must be set with childList, attributes or characterData.
                    // We don't care as spec doesn't specify this rule.
                    kids: !!config.childList,
                    descendents: !!config.subtree,
                    charData: !!(config.characterData || config.characterDataOldValue)
                };

                var watched = this._watched;

                // remove already observed target element from pool
                for (var i = 0; i < watched.length; i++) {
                    if (watched[i].tar === $target) watched.splice(i, 1);
                }

                if (config.attributeFilter) {
                    /**
                     * converts to a {key: true} dict for faster lookup
                     * @type {Object.<String,Boolean>}
                     */
                    settings.afilter = reduce(config.attributeFilter, function (a, b) {
                        a[b] = true;
                        return a;
                    }, {});
                }

                watched.push({
                    tar: $target,
                    fn: createMutationSearcher($target, settings)
                });

                // reconnect if not connected
                if (!this._timeout) {
                    startMutationChecker(this);
                }
            },

            /**
             * Finds mutations since last check and empties the "record queue" i.e. mutations will only be found once
             * @expose
             * @return {Array.<MutationRecord>}
             */
            takeRecords: function () {
                var mutations = [];
                var watched = this._watched;

                for (var i = 0; i < watched.length; i++) {
                    watched[i].fn(mutations);
                }

                return mutations;
            },

            /**
             * @expose
             * @return undefined
             */
            disconnect: function () {
                this._watched = []; // clear the stuff being observed
                clearTimeout(this._timeout); // ready for garbage collection
                /** @private */
                this._timeout = null;
            }
        };

        /**
         * Simple MutationRecord pseudoclass. No longer exposing as its not fully compliant
         * @param {Object} data
         * @return {Object} a MutationRecord
         */
        function MutationRecord(data) {
            var settings = { // technically these should be on proto so hasOwnProperty will return false for non explicitly props
                type: null,
                target: null,
                addedNodes: [],
                removedNodes: [],
                previousSibling: null,
                nextSibling: null,
                attributeName: null,
                attributeNamespace: null,
                oldValue: null
            };
            for (var prop in data) {
                if (has(settings, prop) && data[prop] !== undefined) settings[prop] = data[prop];
            }
            return settings;
        }

        /**
         * Creates a func to find all the mutations
         *
         * @param {Node} $target
         * @param {!Object} config : A custom mutation config
         */
        function createMutationSearcher($target, config) {
            /** type {Elestuct} */
            var $oldstate = clone($target, config); // create the cloned datastructure

            /**
             * consumes array of mutations we can push to
             *
             * @param {Array.<MutationRecord>} mutations
             */
            return function (mutations) {
                var olen = mutations.length, dirty;

                if (config.charData && $target.nodeType === 3 && $target.nodeValue !== $oldstate.charData) {
                    mutations.push(new MutationRecord({
                        type: "characterData",
                        target: $target,
                        oldValue: $oldstate.charData
                    }));
                }

                // Alright we check base level changes in attributes... easy
                if (config.attr && $oldstate.attr) {
                    findAttributeMutations(mutations, $target, $oldstate.attr, config.afilter);
                }

                // check childlist or subtree for mutations
                if (config.kids || config.descendents) {
                    dirty = searchSubtree(mutations, $target, $oldstate, config);
                }

                // reclone data structure if theres changes
                if (dirty || mutations.length !== olen) {
                    /** type {Elestuct} */
                    $oldstate = clone($target, config);
                }
            };
        }

        /* attributes + attributeFilter helpers */

        // Check if the environment has the attribute bug (#4) which cause
        // element.attributes.style to always be null.
        var hasAttributeBug = document.createElement("i");
        hasAttributeBug.style.top = 0;
        hasAttributeBug = hasAttributeBug.attributes.style.value != "null";

        /**
         * Gets an attribute value in an environment without attribute bug
         *
         * @param {Node} el
         * @param {Attr} attr
         * @return {String} an attribute value
         */
        function getAttributeSimple(el, attr) {
            // There is a potential for a warning to occur here if the attribute is a
            // custom attribute in IE<9 with a custom .toString() method. This is
            // just a warning and doesn't affect execution (see #21)
            return attr.value;
        }

        /**
         * Gets an attribute value with special hack for style attribute (see #4)
         *
         * @param {Node} el
         * @param {Attr} attr
         * @return {String} an attribute value
         */
        function getAttributeWithStyleHack(el, attr) {
            // As with getAttributeSimple there is a potential warning for custom attribtues in IE7.
            return attr.name !== "style" ? attr.value : el.style.cssText;
        }

        var getAttributeValue = hasAttributeBug ? getAttributeSimple : getAttributeWithStyleHack;

        /**
         * fast helper to check to see if attributes object of an element has changed
         * doesnt handle the textnode case
         *
         * @param {Array.<MutationRecord>} mutations
         * @param {Node} $target
         * @param {Object.<string, string>} $oldstate : Custom attribute clone data structure from clone
         * @param {Object} filter
         */
        function findAttributeMutations(mutations, $target, $oldstate, filter) {
            var checked = {};
            var attributes = $target.attributes;
            var attr;
            var name;
            var i = attributes.length;
            while (i--) {
                attr = attributes[i];
                name = attr.name;
                if (!filter || has(filter, name)) {
                    if (getAttributeValue($target, attr) !== $oldstate[name]) {
                        // The pushing is redundant but gzips very nicely
                        mutations.push(MutationRecord({
                            type: "attributes",
                            target: $target,
                            attributeName: name,
                            oldValue: $oldstate[name],
                            attributeNamespace: attr.namespaceURI // in ie<8 it incorrectly will return undefined
                        }));
                    }
                    checked[name] = true;
                }
            }
            for (name in $oldstate) {
                if (!(checked[name])) {
                    mutations.push(MutationRecord({
                        target: $target,
                        type: "attributes",
                        attributeName: name,
                        oldValue: $oldstate[name]
                    }));
                }
            }
        }

        /**
         * searchSubtree: array of mutations so far, element, element clone, bool
         * synchronous dfs comparision of two nodes
         * This function is applied to any observed element with childList or subtree specified
         * Sorry this is kind of confusing as shit, tried to comment it a bit...
         * codereview.stackexchange.com/questions/38351 discussion of an earlier version of this func
         *
         * @param {Array} mutations
         * @param {Node} $target
         * @param {!Object} $oldstate : A custom cloned node from clone()
         * @param {!Object} config : A custom mutation config
         */
        function searchSubtree(mutations, $target, $oldstate, config) {
            // Track if the tree is dirty and has to be recomputed (#14).
            var dirty;
            /*
             * Helper to identify node rearrangment and stuff...
             * There is no gaurentee that the same node will be identified for both added and removed nodes
             * if the positions have been shuffled.
             * conflicts array will be emptied by end of operation
             */
            function resolveConflicts(conflicts, node, $kids, $oldkids, numAddedNodes) {
                // the distance between the first conflicting node and the last
                var distance = conflicts.length - 1;
                // prevents same conflict being resolved twice consider when two nodes switch places.
                // only one should be given a mutation event (note -~ is used as a math.ceil shorthand)
                var counter = -~((distance - numAddedNodes) / 2);
                var $cur;
                var oldstruct;
                var conflict;
                while ((conflict = conflicts.pop())) {
                    $cur = $kids[conflict.i];
                    oldstruct = $oldkids[conflict.j];

                    // attempt to determine if there was node rearrangement... won't gaurentee all matches
                    // also handles case where added/removed nodes cause nodes to be identified as conflicts
                    if (config.kids && counter && Math.abs(conflict.i - conflict.j) >= distance) {
                        mutations.push(MutationRecord({
                            type: "childList",
                            target: node,
                            addedNodes: [$cur],
                            removedNodes: [$cur],
                            // haha don't rely on this please
                            nextSibling: $cur.nextSibling,
                            previousSibling: $cur.previousSibling
                        }));
                        counter--; // found conflict
                    }

                    // Alright we found the resorted nodes now check for other types of mutations
                    if (config.attr && oldstruct.attr) findAttributeMutations(mutations, $cur, oldstruct.attr, config.afilter);
                    if (config.charData && $cur.nodeType === 3 && $cur.nodeValue !== oldstruct.charData) {
                        mutations.push(MutationRecord({
                            type: "characterData",
                            target: $cur,
                            oldValue: oldstruct.charData
                        }));
                    }
                    // now look @ subtree
                    if (config.descendents) findMutations($cur, oldstruct);
                }
            }

            /**
             * Main worker. Finds and adds mutations if there are any
             * @param {Node} node
             * @param {!Object} old : A cloned data structure using internal clone
             */
            function findMutations(node, old) {
                var $kids = node.childNodes;
                var $oldkids = old.kids;
                var klen = $kids.length;
                // $oldkids will be undefined for text and comment nodes
                var olen = $oldkids ? $oldkids.length : 0;
                // if (!olen && !klen) return; // both empty; clearly no changes

                // we delay the intialization of these for marginal performance in the expected case (actually quite signficant on large subtrees when these would be otherwise unused)
                // map of checked element of ids to prevent registering the same conflict twice
                var map;
                // array of potential conflicts (ie nodes that may have been re arranged)
                var conflicts;
                var id; // element id from getElementId helper
                var idx; // index of a moved or inserted element

                var oldstruct;
                // current and old nodes
                var $cur;
                var $old;
                // track the number of added nodes so we can resolve conflicts more accurately
                var numAddedNodes = 0;

                // iterate over both old and current child nodes at the same time
                var i = 0, j = 0;
                // while there is still anything left in $kids or $oldkids (same as i < $kids.length || j < $oldkids.length;)
                while (i < klen || j < olen) {
                    // current and old nodes at the indexs
                    $cur = $kids[i];
                    oldstruct = $oldkids[j];
                    $old = oldstruct && oldstruct.node;

                    if ($cur === $old) { // expected case - optimized for this case
                        // check attributes as specified by config
                        if (config.attr && oldstruct.attr) /* oldstruct.attr instead of textnode check */findAttributeMutations(mutations, $cur, oldstruct.attr, config.afilter);
                        // check character data if node is a comment or textNode and it's being observed
                        if (config.charData && oldstruct.charData !== undefined && $cur.nodeValue !== oldstruct.charData) {
                            mutations.push(MutationRecord({
                                type: "characterData",
                                target: $cur,
                                oldValue: oldstruct.charData
                            }));
                        }

                        // resolve conflicts; it will be undefined if there are no conflicts - otherwise an array
                        if (conflicts) resolveConflicts(conflicts, node, $kids, $oldkids, numAddedNodes);

                        // recurse on next level of children. Avoids the recursive call when there are no children left to iterate
                        if (config.descendents && ($cur.childNodes.length || oldstruct.kids && oldstruct.kids.length)) findMutations($cur, oldstruct);

                        i++;
                        j++;
                    } else { // (uncommon case) lookahead until they are the same again or the end of children
                        dirty = true;
                        if (!map) { // delayed initalization (big perf benefit)
                            map = {};
                            conflicts = [];
                        }
                        if ($cur) {
                            // check id is in the location map otherwise do a indexOf search
                            if (!(map[id = getElementId($cur)])) { // to prevent double checking
                                // mark id as found
                                map[id] = true;
                                // custom indexOf using comparitor checking oldkids[i].node === $cur
                                if ((idx = indexOfCustomNode($oldkids, $cur, j)) === -1) {
                                    if (config.kids) {
                                        mutations.push(MutationRecord({
                                            type: "childList",
                                            target: node,
                                            addedNodes: [$cur], // $cur is a new node
                                            nextSibling: $cur.nextSibling,
                                            previousSibling: $cur.previousSibling
                                        }));
                                        numAddedNodes++;
                                    }
                                } else {
                                    conflicts.push({ // add conflict
                                        i: i,
                                        j: idx
                                    });
                                }
                            }
                            i++;
                        }

                        if ($old &&
                            // special case: the changes may have been resolved: i and j appear congurent so we can continue using the expected case
                            $old !== $kids[i]
                        ) {
                            if (!(map[id = getElementId($old)])) {
                                map[id] = true;
                                if ((idx = indexOf($kids, $old, i)) === -1) {
                                    if (config.kids) {
                                        mutations.push(MutationRecord({
                                            type: "childList",
                                            target: old.node,
                                            removedNodes: [$old],
                                            nextSibling: $oldkids[j + 1], // praise no indexoutofbounds exception
                                            previousSibling: $oldkids[j - 1]
                                        }));
                                        numAddedNodes--;
                                    }
                                } else {
                                    conflicts.push({
                                        i: idx,
                                        j: j
                                    });
                                }
                            }
                            j++;
                        }
                    }// end uncommon case
                }// end loop

                // resolve any remaining conflicts
                if (conflicts) resolveConflicts(conflicts, node, $kids, $oldkids, numAddedNodes);
            }
            findMutations($target, $oldstate);
            return dirty;
        }

        /**
         * Utility
         * Cones a element into a custom data structure designed for comparision. https://gist.github.com/megawac/8201012
         *
         * @param {Node} $target
         * @param {!Object} config : A custom mutation config
         * @return {!Object} : Cloned data structure
         */
        function clone($target, config) {
            var recurse = true; // set true so childList we'll always check the first level
            return (function copy($target) {
                var elestruct = {
                    /** @type {Node} */
                    node: $target
                };

                // Store current character data of target text or comment node if the config requests
                // those properties to be observed.
                if (config.charData && ($target.nodeType === 3 || $target.nodeType === 8)) {
                    elestruct.charData = $target.nodeValue;
                }
                // its either a element, comment, doc frag or document node
                else {
                    // Add attr only if subtree is specified or top level and avoid if
                    // attributes is a document object (#13).
                    if (config.attr && recurse && $target.nodeType === 1) {
                        /**
                         * clone live attribute list to an object structure {name: val}
                         * @type {Object.<string, string>}
                         */
                        elestruct.attr = reduce($target.attributes, function (memo, attr) {
                            if (!config.afilter || config.afilter[attr.name]) {
                                memo[attr.name] = getAttributeValue($target, attr);
                            }
                            return memo;
                        }, {});
                    }

                    // whether we should iterate the children of $target node
                    if (recurse && ((config.kids || config.charData) || (config.attr && config.descendents))) {
                        /** @type {Array.<!Object>} : Array of custom clone */
                        elestruct.kids = map($target.childNodes, copy);
                    }

                    recurse = config.descendents;
                }
                return elestruct;
            })($target);
        }

        /**
         * indexOf an element in a collection of custom nodes
         *
         * @param {NodeList} set
         * @param {!Object} $node : A custom cloned node
         * @param {number} idx : index to start the loop
         * @return {number}
         */
        function indexOfCustomNode(set, $node, idx) {
            return indexOf(set, $node, idx, JSCompiler_renameProperty("node"));
        }

        // using a non id (eg outerHTML or nodeValue) is extremely naive and will run into issues with nodes that may appear the same like <li></li>
        var counter = 1; // don't use 0 as id (falsy)
        /** @const */
        var expando = "mo_id";

        /**
         * Attempt to uniquely id an element for hashing. We could optimize this for legacy browsers but it hopefully wont be called enough to be a concern
         *
         * @param {Node} $ele
         * @return {(string|number)}
         */
        function getElementId($ele) {
            try {
                return $ele.id || ($ele[expando] = $ele[expando] || counter++);
            } catch (o_O) { // ie <8 will throw if you set an unknown property on a text node
                try {
                    return $ele.nodeValue; // naive
                } catch (shitie) { // when text node is removed: https://gist.github.com/megawac/8355978 :(
                    return counter++;
                }
            }
        }

        /**
         * **map** Apply a mapping function to each item of a set
         * @param {Array|NodeList} set
         * @param {Function} iterator
         */
        function map(set, iterator) {
            var results = [];
            for (var index = 0; index < set.length; index++) {
                results[index] = iterator(set[index], index, set);
            }
            return results;
        }

        /**
         * **Reduce** builds up a single result from a list of values
         * @param {Array|NodeList|NamedNodeMap} set
         * @param {Function} iterator
         * @param {*} [memo] Initial value of the memo.
         */
        function reduce(set, iterator, memo) {
            for (var index = 0; index < set.length; index++) {
                memo = iterator(memo, set[index], index, set);
            }
            return memo;
        }

        /**
         * **indexOf** find index of item in collection.
         * @param {Array|NodeList} set
         * @param {Object} item
         * @param {number} idx
         * @param {string} [prop] Property on set item to compare to item
         */
        function indexOf(set, item, idx, prop) {
            for (/*idx = ~~idx*/; idx < set.length; idx++) {// start idx is always given as this is internal
                if ((prop ? set[idx][prop] : set[idx]) === item) return idx;
            }
            return -1;
        }

        /**
         * @param {Object} obj
         * @param {(string|number)} prop
         * @return {boolean}
         */
        function has(obj, prop) {
            return obj[prop] !== undefined; // will be nicely inlined by gcc
        }

        // GCC hack see https://stackoverflow.com/a/23202438/1517919
        function JSCompiler_renameProperty(a) {
            return a;
        }

        return MutationObserver;
    })(void 0);
}
/**
 * map-polyfill - A Map polyfill written in TypeScript, unit tested using Jasmine and Karma.
 *
 * @author Brenden Palmer
 * @version v0.0.1-alpha.2
 * @license MIT
 */
!function () {
    "use strict";
    var t;
    !function (t) {
        var e = function () {
            function t(t, e) {
                this.index = 0,
                this.map = null,
                this.done = !1,
                this.map = t,
                this.type = e
            }
            return t.prototype.next = function () {
                var t;
                return this.map.keyArray.length > this.index ? ("entries" === this.type ? t = [this.map.keyArray[this.index], this.map.get(this.map.keyArray[this.index])] : "keys" === this.type ? t = this.map.keyArray[this.index] : "values" === this.type && (t = this.map.get(this.map.keyArray[this.index])), this.index++) : this.done = !0, {
                    value: t,
                    done: this.done
                }
            },
            t
        }
        ();
        t.MapIterator = e
    }
    (t || (t = {}));
    var t;
    !function (t) {
        var e = function () {
            function t() {}
            return Object.defineProperty(t, "MAP_KEY_IDENTIFIER", {
                get: function () {
                    return "MAP_KEY_IDENTIFIER_OZAbzyeCu3_spF91dwX14"
                },
                enumerable: !0,
                configurable: !0
            }),
            Object.defineProperty(t, "MAP_SET_THROWABLE_MESSAGE", {
                get: function () {
                    return "Invalid value used as map key"
                },
                enumerable: !0,
                configurable: !0
            }),
            t
        }
        ();
        t.MapConstants = e
    }
    (t || (t = {}));
    var t;
    !function (t) {
        var e = function () {
            function t() {
                if (null !== t.instance)
                    throw "Get the instance of the MapSequencer using the getInstance method.";
                this.identifier = 0
            }
            return t.getInstance = function () {
                return null === t.instance && (t.instance = new t),
                t.instance
            },
            t.prototype.next = function () {
                return "Map_CJPOYUrpwK_aHBtMHXsTM" + String(this.identifier++)
            },
            t.instance = null,
            t
        }
        ();
        t.MapSequencer = e
    }
    (t || (t = {}));
    var t;
    !function (t) {
        var e = function () {
            function e() {}
            return e.defineProperty = function (n) {
                var r;
                if (e.isValidObject(n) === !1)
                    throw new TypeError(t.MapConstants.MAP_SET_THROWABLE_MESSAGE);
                if ("undefined" == typeof n[t.MapConstants.MAP_KEY_IDENTIFIER]) {
                    r = t.MapSequencer.getInstance().next();
                    try {
                        Object.defineProperty(n, t.MapConstants.MAP_KEY_IDENTIFIER, {
                            enumerable: !1,
                            configurable: !1,
                            get: function () {
                                return r
                            }
                        })
                    } catch (i) {
                        throw new TypeError(t.MapConstants.MAP_SET_THROWABLE_MESSAGE)
                    }
                } else
                    r = n[t.MapConstants.MAP_KEY_IDENTIFIER];
                return r
            },
            e.getProperty = function (n) {
                return e.isValidObject(n) === !0 ? n[t.MapConstants.MAP_KEY_IDENTIFIER] : void 0
            },
            e.isValidObject = function (t) {
                return t === Object(t)
            },
            e
        }
        ();
        t.MapUtils = e
    }
    (t || (t = {}));
    var t;
    !function (t) {
        var e = function () {
            function e(t) {
                void 0 === t && (t = []),
                this.map = {},
                this.keyArray = [];
                for (var e = 0; e < t.length; e++) {
                    var n = t[e];
                    n && n.length >= 2 && this.set(n[0], n[1])
                }
            }
            return e.prototype.get = function (e) {
                if (this.has(e) === !0) {
                    var n = t.MapUtils.getProperty(e);
                    return void 0 === n && (n = String(e)),
                    this.map[n]
                }
            },
            e.prototype.has = function (e) {
                var n = t.MapUtils.getProperty(e);
                return void 0 === n && (n = String(e)),
                void 0 !== n && "undefined" != typeof this.map[n]
            },
            e.prototype["delete"] = function (e) {
                if (this.has(e) === !0) {
                    var n = t.MapUtils.getProperty(e);
                    return void 0 === n && (n = String(e)),
                    this.keyArray.splice(this.keyArray.indexOf(e), 1),
                    delete this.map[n],
                    !0
                }
                return !1
            },
            e.prototype.set = function (e, n) {
                this["delete"](e);
                var r;
                try {
                    r = String(t.MapUtils.defineProperty(e))
                } catch (i) {
                    r = String(e)
                }
                this.keyArray.push(e),
                this.map[r] = n
            },
            e.prototype.entries = function () {
                return new t.MapIterator(this, "entries")
            },
            e.prototype.keys = function () {
                return new t.MapIterator(this, "keys")
            },
            e.prototype.values = function () {
                return new t.MapIterator(this, "values")
            },
            e.prototype.forEach = function (t, e) {
                for (var n = 0, r = this.keyArray; n < r.length; n++) {
                    var i = r[n];
                    e ? t.call(e, this.get(i), i, this) : t(this.get(i), i, this)
                }
            },
            e.prototype.clear = function () {
                this.map = {},
                this.keyArray = []
            },
            e
        }
        ();
        t.Map = e
    }
    (t || (t = {}));
    var t;
    !function (t) {
        window.Map || (window.Map = t.Map)
    }
    (t || (t = {}))
}
();