const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('stockApi', {
    addStock: (name, price, total) => ipcRenderer.invoke('add-stock', name, price, total),
    getStock: () => ipcRenderer.invoke('get-stock')
})

contextBridge.exposeInMainWorld('dialogApi', {
    showErrorMessage: (message) => ipcRenderer.invoke('show-error', message)
})