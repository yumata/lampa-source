import Arrays from './arrays'

class PropsProvider {
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

export default PropsProvider
