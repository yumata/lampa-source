function videoScreenShot(video, screen_width = 320){
    let canvas = document.createElement('canvas')
    let context = canvas.getContext('2d')
    let scale = screen_width / video.videoWidth

    let width = Math.round(video.videoWidth * scale)
    let height = Math.round(video.videoHeight * scale)

    canvas.width = width
    canvas.height = height

    context.drawImage(video, 0, 0, width, height)

    return canvas.toDataURL('image/png')
}

export default {
    videoScreenShot
}