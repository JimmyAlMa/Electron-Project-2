const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('stockApi', {
    addStock: (name, price, total) => ipcRenderer.invoke('add-stock', name, price, total)
})