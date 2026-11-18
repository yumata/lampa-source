/**
 * Навигация вверх/вниз по рядам виртуальной клавиатуры.
 *
 * Общий Navigator (straightOnly) при движении вверх/вниз берёт только элементы,
 * которые перекрывают текущий хотя бы на половину его ширины. Ряды клавиатуры
 * сдвинуты друг относительно друга и содержат разное число клавиш, поэтому над
 * или под частью клавиш такого элемента нет: фокус перескакивает через ряд
 * или вообще уходит с клавиатуры.
 *
 * Здесь шаг всегда идёт в соседний ряд, к клавише, ближайшей по горизонтали.
 * Горизонталь запоминается, пока пользователь двигается только вверх/вниз,
 * поэтому фокус не «сползает» вбок, а вниз-вверх возвращает на ту же клавишу.
 *
 * Модуль не знает о DOM: клавиша — любой объект с getBoundingClientRect().
 */

/**
 * Индекс прямоугольника, ближайшего по горизонтали к точке x.
 * Расстояние считается до края и равно 0, если x внутри, поэтому широкая
 * клавиша ({SPACE}) выбирается, когда x приходится на неё.
 * Скрытые клавиши (нулевой ширины) пропускаются.
 * @param {Array<{left:number, right:number, width:number}>} rects
 * @param {number} x
 * @return {number} индекс или -1
 */
function nearest(rects, x){
    let best = -1
    let distance = Infinity

    rects.forEach((rect, index)=>{
        let gap = Math.max(rect.left - x, x - rect.right, 0)

        if(rect.width > 0 && gap < distance){
            best = index
            distance = gap
        }
    })

    return best
}

function Navigation(){
    let anchor = null

    /**
     * Клавиша в соседнем ряду
     * @param {Array<Array<HTMLElement>>} rows - клавиши по рядам сверху вниз
     * @param {HTMLElement} key - текущая клавиша
     * @param {string} direction - up или down
     * @return {HTMLElement|null} null, если идти некуда
     */
    this.move = function(rows, key, direction){
        let from = rows.findIndex(row=>row.indexOf(key) >= 0)

        if(from < 0) return null

        let row    = rows[from + (direction == 'up' ? -1 : 1)] || []
        let rect   = key.getBoundingClientRect()
        let x      = anchor && anchor.element === key ? anchor.x : rect.left + rect.width / 2
        let target = row[nearest(row.map(elem=>elem.getBoundingClientRect()), x)] || null

        if(target) anchor = {element: target, x}

        return target
    }
}

export default Navigation
