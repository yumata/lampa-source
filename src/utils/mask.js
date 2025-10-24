/**
 * Для работы с битовыми масками
 * @example
 * import Mask from '../utils/mask'
 * import Arrays from '../utils/arrays'
 * const Helper = new Mask(Arrays.getKeys(Map))
 * // где Map - объект с модулями
 * // например: {Mark:..., Watchlist:..., Favorite:...}
 * // теперь можно использовать Helper для работы с масками
 * // например:
 * // Helper.MASK.Mark - битовая маска для модуля Mark
 * // Helper.MASK.Favorite - битовая маска для модуля Favorite
 * // Helper.MASK.all - битовая маска для всех модулей
 * // Helper.MASK.none - битовая маска для отсутствия модулей
 * // Helper.only('Mark','Favorite') - битовая маска только для модулей Mark и Favorite
 * // Helper.add(mask,'Watchlist') - добавляет модуль Watchlist к маске mask
 * // Helper.remove(mask,'Mark') - удаляет модуль Mark из маски mask
 * // Helper.toggle(mask,'Favorite') - переключает наличие модуля Favorite в маске mask
 * // Helper.except('Mark') - битовая маска для всех модулей кроме Mark
 * // Helper.has(mask,'Mark') - проверяет наличие модуля Mark в маске mask
 * // Helper.getNames(mask) - возвращает массив названий модулей, присутствующих в маске mask
 * // Helper.toObject(mask) - возвращает объект с названиями модулей и булевыми значениями их наличия в маске mask
 * // Helper.describe(mask) - возвращает строковое описание модулей, присутствующих в маске mask  
 */
class Mask {
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

export default Mask