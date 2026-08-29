const navbar = document.querySelector('nav')
const stockContainer = document.querySelector('#stockContainer')
const cashierContainer = document.querySelector('#cashierContainer')
const historyContainer = document.querySelector('#historyContainer')
navbar.addEventListener('click', (event) => {
    const target = event.target

    if (target.matches('.stockNav')) {
        stockContainer.style.display = 'grid'
        cashierContainer.style.display = 'none'
        historyContainer.style.display = 'none'
    }

    if (target.matches('.transactionNav')) {
        stockContainer.style.display = 'none'
        cashierContainer.style.display = 'grid'
        historyContainer.style.display = 'none'
    }

    if (target.matches('.historyNav')) {
        stockContainer.style.display = 'none'
        cashierContainer.style.display = 'none'
        historyContainer.style.display = 'flex'
    }
})

async function addStock() {
    const productInput = document.getElementById('stockInputProduct')
    const priceInput = document.getElementById('stockInputPrice')
    const totalInput = document.getElementById('stockInputTotal')

    const name = productInput.value.trim()
    const price = priceInput.value
    const total = totalInput.value

    // Validate Input
    if (!name) {
        await window.dialogApi.showErrorMessage('Product name cannot be empty')
        productInput.focus()
        return
    }
    if (!price) {
        await window.dialogApi.showErrorMessage('Product price cannot be empty')
        priceInput.focus()
        return
    }
    if (!total) {
        await window.dialogApi.showErrorMessage('Product total cannot be empty')
        totalInput.focus()
        return
    }

    // Number Conversion and Value Validation
    const priceNum = Number(price)
    const totalNum = Number(total)

    if (!Number.isInteger(priceNum) || priceNum < 0) {
        await window.dialogApi.showErrorMessage('Price not valid')
        return
    }
    if (!Number.isInteger(totalNum) || totalNum < 0) {
        await window.dialogApi.showErrorMessage('Total not valid')
        return
    }

    // Send To Main
    const result = await window.stockApi.addStock(name, priceNum, totalNum)

    if (result.success) {
        productInput.value = ''
        priceInput.value = ''
        totalInput.value = ''
        await getStockData()
    } else {
        await window.dialogApi.showErrorMessage(`${result.error}`)
    }
}

let allStock = []
let userCart = []
async function getStockData() {
    const result = await window.stockApi.getStock()

    if (!result.success) {
        console.log(result.error)
        return
    }

    allStock = result.data
    renderStockList()
}

function renderStockList() {

    const stockLists = document.querySelectorAll('.stockList')
    
    stockLists.forEach(stockList => {
        stockList.innerHTML = ''

        allStock.forEach(info => {
            const cartItem = userCart.find(item => item.id === info.id)
            const displayedTotal = info.total - (cartItem ? cartItem.total : 0)

            const li = document.createElement('li')
            li.className = 'productList'
            
            const textSpan = document.createElement('span')
            textSpan.className = 'productText'
            textSpan.textContent = `(${info.id}) ${info.name} | ${info.price} | ${displayedTotal}`

            if (displayedTotal > 0) {
                textSpan.addEventListener('click', () => addToCart(info))
            }

            const deleteButton = document.createElement('button')
            deleteButton.className = 'deleteProductButton'
            deleteButton.textContent = 'Delete'
            deleteButton.addEventListener('click', () => deleteProduct(info.id))

            li.appendChild(textSpan)
            li.appendChild(deleteButton)
            stockList.appendChild(li)
        })
    })
}

function renderCart() {
    const cartList = document.querySelector('#cartList')
    cartList.innerHTML = ''
    
    userCart.forEach(item => {
        const li = document.createElement('li')

        const textSpan = document.createElement('span')
        textSpan.textContent = `${item.name} | ${item.price} x ${item.total}`
        textSpan.addEventListener('click', () => reduceFromCart(item.id))

        li.appendChild(textSpan)
        cartList.appendChild(li)
    })
}

function addToCart(product) {
    const existing = userCart.find(item => item.id === product.id)
    
    if (existing) {
        existing.total += 1
    } else {
        userCart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            total: 1
        })
    }
    renderCart()
    renderStockList()
}

function reduceFromCart(id) {
    const existing = userCart.find(item => item.id === id)

    if (!existing) return

    existing.total -= 1

    if (existing.total <= 0) {
        userCart = userCart.filter(item => item.id !== id)
    }
    renderCart()
    renderStockList()
}

async function deleteProduct(id) {
    const result = await window.stockApi.deleteStock(id)

    if (result.success) {
        getStockData()
    } else {s
        console.log(result.error)
    }
}

async function payCart() {
    if (userCart.length === 0) {
        await window.dialogApi.showErrorMessage('Cart is empty')
        return
    }

    const result = await window.stockApi.checkoutCart(userCart)

    if (!result.success) {
        console.log(result.error)
        await window.dialogApi.showErrorMessage('Something error, try again later...')
    }

    const failedItems = result.result.filter(r => !r.success)
    if (failedItems.length > 0) {
        failedItems.forEach(f => console.log(f.error))
    }

    userCart = []
    renderCart()
    await getStockData()
    await getPaymentHistory()
}

async function getPaymentHistory() {
    const result = await window.stockApi.getPaymentHistory()

    if (!result.success) {
        console.log(result.error)
        return
    }

    const historyLst = document.querySelector('#historyList')
    historyLst.innerHTML = ''
    
    result.data.forEach(payment => {
        const li = document.createElement('li')

        const header = document.createElement('div')
        header.textContent = `Transaction #${payment.id} | ${payment.created_at} | Total: Rp${payment.total_price}`
        li.appendChild(header)

        const itemList = document.createElement('ul')
        payment.items.forEach(item => {
            const itemLi = document.createElement('li')
            itemLi.textContent = `${item.product_name} | Rp${item.price} x ${item.qty}`
            itemList.appendChild(itemLi)
        })
        li.appendChild(itemList)

        historyLst.appendChild(li)
    })
}

// To-Do Task for tommorow
// Bikin payment button bekerja, stock database berkurang, dan bikin semua produk di userCart hilang.
// Dan ketika sukses bayar, masukan ke history payment

getStockData()