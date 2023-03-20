const express = require('express')
const app = express()
const port = 3000

const fs = require('fs')
const { parse} = require('csv-parse')
const { stringify } = require('csv-stringify')

const open = require('open')

open(`http://localhost:${port}/`)

const IMAGES_PATH = 'images'
const OUTPUT_FILE = './output/images.csv'

app.use(express.json())

app.use('/', express.static('public'))

app.use('/', express.static(IMAGES_PATH))

app.get('/images_names', (req, res) => {
    fs.readdir(IMAGES_PATH, (err, files) => {
        let filenames = []
        let temp = []
        for (const f of files) {
            filenames.push(f)
        }
        filenames.sort()

        // compare filenames to send with filenames already listed in the images csv

        let already_rated_images = []
        fs.createReadStream(OUTPUT_FILE)
            .pipe(parse({delimiter: ','}))
            .on('data', row => {
                already_rated_images.push(row[0])
            })
            .on('end', () => {
                console.log(`${filenames.length} - ${already_rated_images.length} = ${filenames.length - already_rated_images.length}`)
                if (already_rated_images.length > 0) {
                    // remove all images in already rated from filenames
                    for (const image of filenames) {
                        if (already_rated_images.includes(image)) {
                            continue
                        } else {
                            temp.push(image)
                        }
                    }
                } else {
                    temp = filenames
                }
                console.log(temp.length)
                res.json({
                    filenames: temp
                })
            })
    })
})

app.post('/classify', (req, res) => {
    console.log('recieved POST request')
    let image_data = []
    fs.createReadStream(OUTPUT_FILE)
        .pipe(parse({delimiter: ','}))
        .on('data', row => {
            image_data.push(row)
        })
        .on('end', () => {
            // add new data and rewrite to CSV
            image_data.push([req.body.filename, req.body.fashionable ? '1' : '0'])
            image_data.sort()
            unique_images = []
            for (const image of image_data) {
                let test_positive = [image_data[0], 1]
                let test_negative = [image_data[0], 0]
                if (!unique_images.includes(test_negative) && !unique_images.includes(test_positive)) {
                    unique_images.push(image)
                }
            }
            writeableStream = fs.createWriteStream(OUTPUT_FILE)
            let stringifier = stringify({header: false, columns: ['filename', 'fashionable']})
            for (const image of unique_images) {
                stringifier.write(image)
            }
            stringifier.pipe(writeableStream)
            res.sendStatus(200)
        })
        .on('error', () => {
            res.sendStatus(500)
        })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})