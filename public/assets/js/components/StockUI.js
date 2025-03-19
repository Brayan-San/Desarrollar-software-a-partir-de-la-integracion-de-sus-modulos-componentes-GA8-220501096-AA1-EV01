function updateStockUI(productId, talla, stock) {
    const stockIndicator = document.createElement('span');
    stockIndicator.className = 'stock-indicator';
    
    if (stock === 0) {
        stockIndicator.textContent = 'Agotado';
        stockIndicator.classList.add('out-of-stock');
    } else if (stock <= 5) {
        stockIndicator.textContent = `¡Últimas ${stock} unidades!`;
        stockIndicator.classList.add('low-stock');
    }
    
    const tallaBtn = document.querySelector(`[data-talla="${talla}"]`);
    if (tallaBtn) {
        tallaBtn.appendChild(stockIndicator);
    }
}

// Exportar para uso en otros archivos
export { updateStockUI };