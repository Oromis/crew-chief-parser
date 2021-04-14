const fs = require('fs')
const readline = require('readline')

const DECIMAL = "[\\d.]+"
const CSV_SEPARATOR = ";"
const DECIMAL_SEPARATOR = ","

const fuelPerMinute = []
const fuelPerLap = []

function parseFuelPerMinute(line) {
    let match = line.match(/Fuel use per minute \(basic calc\) = ([\d.]+)/i)
    if (match) {
        fuelPerMinute.push({
            windowed: +match[1],
            max: "-",
        })
    } else {
        match = line.match(/Fuel use per minute: windowed calc=([\d.]+), max per lap calc=([\d.]+)/i)
        if (match) {
            fuelPerMinute.push({
                windowed: +match[1],
                max: +match[2],
            })
        }
    }
}

function parseFuelPerLap(line) {
    let match = line.match(/Fuel use per lap \(basic calc\) = ([\d.]+)/i)
    if (match) {
        fuelPerLap.push({
            windowed: +match[1],
            max: "-",
        })
    } else {
        match = line.match(/Fuel use per lap: windowed calc=([\d.]+), max per lap=([\d.]+)/i)
        if (match) {
            fuelPerLap.push({
                windowed: +match[1],
                max: +match[2],
            })
        }
    }
}

function formatCsv(elements) {
    return elements
        .map(e => typeof e === 'number' ? e.toString().replace('.', DECIMAL_SEPARATOR) : e.toString())
        .join(CSV_SEPARATOR)
}

function printTableBody(data, extractor) {
    for (let index = 0; index < data.length; ++index) {
        const entry = data[index]
        console.log(formatCsv([index + 1, ...extractor(entry)]))
    }
}

function printTable(headers, data, extractor) {
    console.log(formatCsv(headers))
    printTableBody(data, extractor)
}

function printSectionHeader(title) {
    console.log()
    console.log("-----------------------------------------------------------------------------------")
    console.log(`  ${title}`)
    console.log("-----------------------------------------------------------------------------------")
    console.log()
}

function main() {
    const args = process.argv
    if (args.length < 3) {
        console.error(`Usage: ${args[0]} ${args[1]} [log-file]`)
        process.exit(1)
    }

    const readInterface = readline.createInterface({
        input: fs.createReadStream(args[2]),
    })

    readInterface.on('line', line => {
        parseFuelPerMinute(line)
        parseFuelPerLap(line)
    })

    readInterface.on('close', () => {
        printSectionHeader(`Fuel per minute (${fuelPerMinute.length}): `)
        printTable(['Index', 'Windowed', 'Max'], fuelPerMinute, entry => [entry.windowed, entry.max])

        printSectionHeader(`Fuel per lap (${fuelPerLap.length}): `)
        printTable(['Index', 'Windowed', 'Max'], fuelPerLap, entry => [entry.windowed, entry.max])
    })
}

main()
