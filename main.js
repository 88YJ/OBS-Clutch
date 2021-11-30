const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const child = require('child_process')
const fs = require('fs')
const gamesDB = require('./games.json')

const basePath = app.getAppPath()
const batchPath = basePath + '\\obs.bat'
const obsSettings = basePath + '\\Untitled.json'
const encodedColonASCII = '#3A'

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 1000,
        icon: 'Images/Icon.png',
        webPreferences: {
            nodeIntegration: true,
        },
    })

    win.setMenu(null)
    win.loadURL('http://localhost:3000')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

ipcMain.handle('game-play', async (event, gameLocation) => {
    child.spawn(gameLocation)

    let processName = gameLocation.substring(gameLocation.lastIndexOf('\\') + 1, gameLocation.length)
    let windowTitle = await getWindowTitle(processName)

    let response = {
        processName: processName,
        windowTitle: windowTitle,
    }

    return response
})

ipcMain.handle('game-stream', async (event, game) => {
    let { windowTitle, processName } = game
    await updateObsSettings(windowTitle, processName)

    child.execFile(batchPath, (err, data) => {
        if (err) {
            console.log(err)
        }
        console.log(data)
    })

    return await getWindowTitle('obs64.exe')
})

ipcMain.handle('game-local-add', async (event) => {
    let name
    let wideImg
    let fileSelection = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Games', extensions: ['exe'] }],
    })

    const { canceled, filePaths } = fileSelection

    if (canceled) {
        return
    }
    gamesDB.forEach((element) => {
        if (filePaths[0].includes(element.exe)) {
            name = element.name
            wideImg = element.wideImg
        }
    })
    console.log(filePaths)

    let icon = (await app.getFileIcon(filePaths[0])).toDataURL()
    const response = {
        icon: icon,
        path: filePaths[0],
        name: name,
        wideImg: wideImg,
    }

    return response
})

const getProcessData = async (processName) => {
    return new Promise((resolve, reject) => {
        child.exec(`tasklist /V /FI "IMAGENAME eq ${processName}" /FO LIST`, (err, data) => {
            if (err) {
                console.error(err)
                reject(err)
            }

            resolve(data)
        })
    })
}

const getWindowTitle = async (processName) => {
    return new Promise(async (resolve) => {
        let windowTitle = 'N/A'
        while (windowTitle === 'N/A') {
            await timeout(5000)
            let data = await getProcessData(processName)
            console.log(data)
            let lines = data.split('\n')

            if (lines.length >= 9) {
                windowTitle = lines[lines.length - 2]
                windowTitle = windowTitle.substring(windowTitle.indexOf(':') + 2, windowTitle.length)
            }
        }

        resolve(windowTitle)
    })
}

const updateObsSettings = async (windowTitle, processName) => {
    let sourceWindow = ''

    for (let i = 0; i < windowTitle.length - 1; i++) {
        let currentChar = windowTitle.charAt(i)
        if (currentChar === ':') {
            sourceWindow += encodedColonASCII
        } else {
            sourceWindow += currentChar
        }
    }

    sourceWindow += ':'
    for (let i = 0; i < processName.length - 4; i++) {
        sourceWindow += processName.charAt(i)
    }

    sourceWindow += ':'
    for (let i = 0; i < processName.length; i++) {
        sourceWindow += processName.charAt(i)
    }

    return new Promise((resolve, reject) => {
        fs.readFile(obsSettings, (err, data) => {
            let settingsJson = JSON.parse(data)

            settingsJson.sources[0].settings.window = sourceWindow

            fs.writeFile(obsSettings, JSON.stringify(settingsJson), (err) => {
                if (err) {
                    console.log(err)
                    reject(err)
                }
                resolve()
            })
        })
    })
}

const timeout = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
