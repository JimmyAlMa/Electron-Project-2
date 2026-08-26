const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('stockApi', {
    addStock: (name, price, total) => ipcRenderer.invoke('add-stock', name, price, total),
    getStock: () => ipcRenderer.invoke('get-stock'),
    deleteStock: (id) => ipcRenderer.invoke('delete-stock', id),
    updateTotalStock: (qty, id) => ipcRenderer.invoke('update-total-stock', qty, id)
})

contextBridge.exposeInMainWorld('dialogApi', {
    showErrorMessage: (message) => ipcRenderer.invoke('show-error', message)
})