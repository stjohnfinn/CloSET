console.log("Let's classify!")

let images = []

axios.get('/images_names')
    .then(response => response.data)
    .then(data => {
        console.log(data)
        return data.filenames
    })
    .then(filenames => {
        images = filenames.sort()
    })
    .then(() => {
        document.querySelector('#good').disabled = false
        document.querySelector('#bad').disabled = false
        refreshImage()
    })

let index = 0

function refreshImage() {
    document.querySelector('img').setAttribute('src', `${images[index]}`)
    document.querySelector('p').innerText = images[index]
    index++
    if (index > images.length) {
        document.querySelector('#good').disabled = true
        document.querySelector('#bad').disabled = true
    }
}

document.querySelector('#good').addEventListener('click', () => {

    axios.post('/classify', {
        filename: images[index-1],
        fashionable: true
    })
        .then(response => {
            console.log(response)
        })
        .then(() => {
            refreshImage()
        })
})

document.querySelector('#bad').addEventListener('click', () => {
    axios.post('/classify', {
        filename: images[index-1],
        fashionable: false
    })
        .then(response => {
            console.log(response)
        })
        .then(() => {
            refreshImage()
        })
})