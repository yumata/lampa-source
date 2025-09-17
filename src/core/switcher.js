function init() {
    let keyboard_mode = false

    // Style to disable hover effects
    let style = document.createElement("style")
        style.innerHTML = "* { pointer-events: none !important; }"

    // Disable hover on any keyboard event
    document.addEventListener("keydown", (event) => {
        let tagName = ''

		try{
			tagName = event.target.tagName.toLowerCase()
		}
		catch(e){}
		
        if (!keyboard_mode && !(tagName == "input" || tagName == "textarea")) {
            console.log('HoverSwitcher','Keyboard moved, disabling pointer events')

            keyboard_mode = true

            document.head.appendChild(style)
        }
    })

    function mouse(){
        if (keyboard_mode) {
            console.log('HoverSwitcher', 'Mouse moved, enabling pointer events')

            keyboard_mode = false

            document.head.removeChild(style)
        }
    }

    // Re-enable hover on mouse movement or touch
    document.addEventListener("mousemove", mouse)
    document.addEventListener("touchmove", mouse)
}   

export default {
    init
}