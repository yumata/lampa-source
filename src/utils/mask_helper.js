class MaskHelper {
    constructor(moduleNames) {
        this.moduleNames = moduleNames;
        this.nameToBit = {};
        this.bitToName = {};
        this.MASK = {};

        moduleNames.forEach((name, index) => {
            const bit = 1 << index;
            this.nameToBit[name] = bit;
            this.bitToName[bit] = name;
            this.MASK[name] = bit;
        });

        this.MASK.all = (1 << moduleNames.length) - 1;
        this.MASK.none = 0;
    }

    only(...names) {
        return names.reduce((mask, name) => mask | this._bit(name), 0);
    }

    add(mask, ...names) {
        return mask | this.only(...names);
    }

    remove(mask, ...names) {
        return names.reduce((acc, name) => acc & ~this._bit(name), mask);
    }

    toggle(mask, ...names) {
        return names.reduce((acc, name) => acc ^ this._bit(name), mask);
    }

    except(...names) {
        return this.remove(this.MASK.all, ...names);
    }

    has(mask, name) {
        return (mask & this._bit(name)) !== 0;
    }

    getNames(mask) {
        return this.moduleNames.filter(name => this.has(mask, name));
    }

    toObject(mask) {
        const obj = {};
        this.moduleNames.forEach(name => {
            obj[name] = this.has(mask, name);
        });
        return obj;
    }

    describe(mask) {
        const names = this.getNames(mask);
        return names.length ? names.join(', ') : '(none)';
    }

    _bit(name) {
        if (!(name in this.nameToBit)) throw new Error(`Unknown module name: ${name}`);
        return this.nameToBit[name];
    }
}

export default MaskHelper