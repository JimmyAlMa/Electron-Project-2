const { app, BrowserWindow, ipcMain } = require('electron')
const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

let db

function initDatabase() {
    const userDataPath = app.getPath('userData')

    if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, {recursive: true})
    }

    const dbPath = path.join(userDataPath, 'stock.db')
    db = new Database(dbPath)

    db.exec(`
        CREATE TABLE IF NOT EXISTS stock (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price INTEGER NOT NULL DEFAULT 0,
            total INTEGER NOT NULL DEFAULT 0
        )
    `)
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    })

    win.loadFile('index.html')
}

app.whenReady().then(() => {
    initDatabase()
    createWindow()
})

ipcMain.handle('add-stock', (event, name, price, total) => {
    try {
        const stmt = db.prepare(`
                INSERT INTO stock (name, price, total)
                VALUES (?, ?, ?)
            `)
        const info = stmt.run(name, price, total)
        return { success: true, id: info.lastInsertRowid }
    } catch (err) {
        console.error('Failed to add stock', err)
        return { success: false, error: err.message }
    }
})