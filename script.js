// Variables globales
let selectedCells = new Set();
let clipboardData = [];
let currentDevice = 'desktop';
let undoStack = [];
let redoStack = [];

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    initializeTable();
    initializeEnhancedTable();
    bindEvents();
    initializeSliders();
    initializeDevicePreview();
    optimizeResponsiveExperience();
    initializeCodeModal();
    
    // Inicializar escalas
    updatePromoImageScale();
    
    // Inicializar estado de las secciones opcionales
    toggleEventInfo();
    toggleTitle();
    toggleFooter();
});

// Funciones de inicialización
function initializeTable() {
    // Inicializar celdas editables en versión desktop
    const editableCells = document.querySelectorAll('.editable-cell, .editable-header');
    editableCells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
        cell.addEventListener('dblclick', handleCellDoubleClick);
    });

    // Inicializar celdas editables en versión mobile
    const editableCellsMobile = document.querySelectorAll('.editable-cell-mobile, .editable-header-mobile');
    editableCellsMobile.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
        cell.addEventListener('dblclick', handleCellDoubleClick);
    });

    // Inicializar headers para selección de columna
    const headers = document.querySelectorAll('.header-precio-orbita, .header-servicio-orbita');
    headers.forEach(header => {
        header.addEventListener('click', (e) => {
            if (!e.target.classList.contains('editable-header')) {
                selectEntireColumn(header);
            }
        });
    });

    // Agregar listeners para selección múltiple
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

// Manejo de celdas y selección
function handleCellClick(event) {
    const cell = event.target.closest('.editable-cell') || event.target.closest('.editable-cell-mobile');
    if (!cell) return;

    if (event.shiftKey || event.ctrlKey || event.metaKey) {
        // Modo selección múltiple
        toggleCellSelection(cell);
    } else {
        // Modo selección simple
        clearSelection();
        toggleCellSelection(cell);
    }
}

function toggleCellSelection(cell) {
    if (selectedCells.has(cell)) {
        cell.classList.remove('cell-selected');
        selectedCells.delete(cell);
    } else {
        cell.classList.add('cell-selected');
        selectedCells.add(cell);
    }
    if (selectedCells.size > 0) {
        showToast(`${selectedCells.size} celda(s) seleccionada(s)`);
    }
}

// Copiar y pegar
function copySelectedCells() {
    if (selectedCells.size === 0) return;
    clipboardData = Array.from(selectedCells).map(cell => cell.textContent);
    showToast(`Copiado: ${clipboardData.length} valor(es)`);
}

function pasteToCells() {
    if (clipboardData.length === 0 || selectedCells.size === 0) return;
    
    saveToUndo();
    const cellsArray = Array.from(selectedCells);
    
    cellsArray.forEach((cell, index) => {
        const value = clipboardData[index % clipboardData.length];
        handleCellEdit(cell, value);
    });

    showToast(`Pegado en ${selectedCells.size} celda(s)`);
}

// Funciones de edición
function handleCellEdit(cell, newValue) {
    const oldValue = cell.textContent;
    cell.textContent = newValue;
    
    // Sincronizar entre desktop y mobile
    syncCellContent(cell, newValue);
    
    // Mantener la selección
    if (!cell.classList.contains('cell-selected')) {
        cell.classList.add('cell-selected');
        selectedCells.add(cell);
    }
}

// Funciones de UI
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        z-index: 9999;
        font-size: 14px;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
}

// Funciones de sincronización
function syncCellContent(cell, newValue) {
    // Encontrar la fila padre
    const row = cell.closest('.fila-datos-orbita') || cell.closest('.fila-datos-mobile-orbita');
    if (!row) return;
    
    // Determinar si estamos en desktop o mobile
    const isDesktop = cell.classList.contains('editable-cell');
    
    // Obtener el índice de la celda dentro de su contenedor
    let cellIndex;
    if (isDesktop) {
        const cells = row.querySelectorAll('.editable-cell');
        cellIndex = Array.from(cells).indexOf(cell);
    } else {
        const cells = row.querySelectorAll('.editable-cell-mobile');
        cellIndex = Array.from(cells).indexOf(cell);
    }
    
    if (cellIndex === -1) return;
    
    // Sincronizar el contenido
    if (isDesktop) {
        // Actualizar mobile
        const mobileRows = document.querySelectorAll('.fila-datos-mobile-orbita');
        if (mobileRows[rowIndex]) {
            const mobileCells = mobileRows[rowIndex].querySelectorAll('.editable-cell-mobile');
            if (mobileCells[cellIndex]) {
                mobileCells[cellIndex].textContent = newValue;
            }
        }
    } else {
        // Actualizar desktop
        const desktopRows = document.querySelectorAll('.fila-datos-orbita');
        if (desktopRows[rowIndex]) {
            const desktopCells = desktopRows[rowIndex].querySelectorAll('.editable-cell');
            if (desktopCells[cellIndex]) {
                desktopCells[cellIndex].textContent = newValue;
            }
        }
    }
}

// Exportar funciones necesarias
window.initializeTable = initializeTable;
window.handleCellClick = handleCellClick;
window.handleCellEdit = handleCellEdit;
window.toggleEventInfo = toggleEventInfo;
window.toggleFooter = toggleFooter;
window.toggleTitle = toggleTitle;
window.copySelectedCells = copySelectedCells;
window.pasteToCells = pasteToCells; 