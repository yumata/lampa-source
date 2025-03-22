// Style to disable hover effects
const noHoverStyle = document.createElement("style")
noHoverStyle.innerHTML = "* { pointer-events: none !important; }"

let isKeyboardMode = false

function init() {
    // Disable hover on any keyboard event
    document.addEventListener("keydown", (event) => {
        let tagName = ''

		try{
			tagName = event.target.tagName.toLowerCase()
		}
		catch(e){}
		
        if (!isKeyboardMode && !(tagName == "input" || tagName == "textarea")) {
            console.log('HoverSwitcher','Keyboard moved, disabling pointer events')

            isKeyboardMode = true

            document.head.appendChild(noHoverStyle)
        }
    })

    // Re-enable hover on mouse movement
    document.addEventListener("mousemove", () => {
        if (isKeyboardMode) {
            console.log('HoverSwitcher', 'Mouse moved, enabling pointer events')

            isKeyboardMode = false

            document.head.removeChild(noHoverStyle)
        }
    })
}

export default {
    init
}