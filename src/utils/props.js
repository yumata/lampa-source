import Arrays from './arrays'

/**
 * Универсальный провайдер пропсов
 * @param data - начальные данные
 * @example
    let props = new Props({a:1, b:2})

    props.set('c', 3)
    props.set({a:10, d:4})

    console.log(props.get('a')) // 10
    console.log(props.get('b')) // 2
    console.log(props.get('c')) // 3
    console.log(props.get('d')) // 4
    console.log(props.get('e', 5)) // 5

    console.log(props.pick('a','b','e')) // {a:10, b:2, e:undefined}

    console.log(props.all()) // {a:10, b:2, c:3, d:4}
 */
class Props {
    constructor(data) {
        this.data = data || {}
    }

    set = (key, value) => {
        if(Arrays.isObject(key)) {
            for(let k in key) {
                this.data[k] = key[k]
            }

            return
        }

        this.data[key] = value
    }

    get = (key, def) => this.data[key] || def

    pick = (...keys) => Object.fromEntries(keys.map(k => [k, this.data[k]]))

    all = () => this.data
}

export default Props
