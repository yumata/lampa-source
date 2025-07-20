function Events(instance, data) {
    const el = instance.render(true)

    el.on('hover:enter', (e) => {
        if (instance.onEnter) instance.onEnter(el, data)
    })

    el.on('hover:focus', (e) => {
        if (instance.onHover) instance.onHover(el, data)
    })
}

export default Events