const { app, BrowserWindow, ipcMain, dialog } = require('electron')
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

ipcMain.handle('get-stock', () => {
    try {
        const stmt = db.prepare(`
            SELECT * FROM stock ORDER BY id ASC
            `)
        const info = stmt.all()
        return { success: true, data: info }
    } catch (err) {
        console.error('Failed to get data', err)
        return { success: false, error: err.message }
    }
})

ipcMain.handle('delete-stock', (event, id) => {
    try {
        const stmt = db.prepare(`DELETE FROM stock WHERE id = ?`)
        const info = stmt.run(id)
        return { success: true, data: info.changes }
    } catch (err) {
        console.error('Failed to delete data', err)
        return { success: false, error: err.message }
    }
})

ipcMain.handle('update-total-stock', (event, qty, id) => {
    if (!Number.isInteger(qty) || qty < 0) {
        return { success: false, error: 'Total not valid' }
    }

    try {
        const stmt = db.prepare(`
                UPDATE stock SET total = ? WHERE id = ?
            `)
        const info = stmt.run(qty, id)
        
        return { success: true, updated: info.changes }
    } catch (err) {
        console.error(err)
        return { success: false, error: err.message }
    }
})

ipcMain.handle('checkout-stock', (event, cartItem) => {
    try {
        const result = []

        const checkout = db.transaction((items) => {
            for (const item of items) {
                const current = db.prepare('SELECT total FROM stock WHERE id = ?').get(item.id)

                if (!current) {
                    result.push({ id: item.id, success: false, error: 'Item not found' })
                    continue
                }

                if (current.total < item.total) {
                    result.push({ id: item.id, success: false, error: `${item.name} stock not enough` })
                    continue
                }

                const newTotal = current.total - item.total

                if (newTotal <= 0) {
                    db.prepare('DELETE FROM stock WHERE id = ?').run(item.id)
                    result.push({ id: item.id, success: true, deleted: true })
                } else {
                    db.prepare('UPDATE stock SET total = ? WHERE id = ?').run(newTotal, item.id)
                    result.push({ id: item.id, success: true, deleted: false, newTotal })
                }
            }
        })

        checkout(cartItem)

        return { success: true, result }
    } catch (err) {
        console.error(err)
        return { success: false, error: err.message }

    }
})

ipcMain.handle('show-error', (event, message) => {
    dialog.showErrorBox('Error:', message)
})