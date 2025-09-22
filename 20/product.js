import { productAPI } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();

    const addProductForm = document.getElementById('addProductForm');
    addProductForm.addEventListener('submit', handleAddProduct);
});

// جلب جميع المنتجات
async function fetchProducts() {
    try {
        const result = await productAPI.getProducts();

        if (result.success) {
            console.log("Fetched products data:", result.data); // Log all products
            displayProducts(result.data);
        } else {
            throw new Error(result.message || 'حدث خطأ أثناء جلب البيانات');
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        showAlert(error.message, 'error');
    }
}

// عرض المنتجات في الجدول
function displayProducts(products) {
    const productsTableBody = document.querySelector('#productsTable tbody');
    productsTableBody.innerHTML = '';

    products.forEach(product => {
        // console.log("Processing product:", product); // Removed log
        const row = productsTableBody.insertRow();
        row.dataset.productId = product.productId; // Still use camelCase for dataset

        const idCell = row.insertCell();
        idCell.textContent = product.productId;

        const nameCell = row.insertCell();
        nameCell.textContent = product.name;
        nameCell.dataset.field = 'name'; // Still use camelCase for dataset
        nameCell.contentEditable = true; // Make it editable
        setupCellEditing(nameCell, product.productId, 'name', product.name);


        const priceCell = row.insertCell();
        priceCell.textContent = product.price.toFixed(2);
        priceCell.dataset.field = 'price'; // Still use camelCase for dataset
        priceCell.contentEditable = true;
        setupCellEditing(priceCell, product.productId, 'price', product.price);

        const quantityCell = row.insertCell();
        quantityCell.textContent = product.quantity;
        quantityCell.dataset.field = 'quantity'; // Still use camelCase for dataset
        quantityCell.contentEditable = true;
        setupCellEditing(quantityCell, product.productId, 'quantity', product.quantity);

        const actionsCell = row.insertCell();

        // Removed the old edit button as we are enabling direct editing
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.addEventListener('click', () => deleteProduct(product.productId));
        actionsCell.appendChild(deleteButton);
    });
}

// Helper function to set up in-place editing for a cell
async function setupCellEditing(cell, productId, field, initialValue) {
    cell.addEventListener('blur', async (e) => {
        const newValue = e.target.textContent.trim();
        if (newValue === initialValue.toString()) {
            return; // No change
        }

        // Fetch the existing product to ensure we send a complete object back
        const existingProductResult = await productAPI.getProductById(productId);
        if (!existingProductResult.success) {
            showAlert(existingProductResult.message || 'حدث خطأ أثناء جلب بيانات المنتج.', 'error');
            e.target.textContent = initialValue; // Revert to old value
            return;
        }
        const updatedProduct = { ...existingProductResult.data }; // Create a mutable copy

        // Map frontend camelCase field to backend PascalCase and update the value
        const backendField = field.charAt(0).toUpperCase() + field.slice(1);
        let processedValue = (field === 'price') ? parseFloat(newValue) : ((field === 'quantity') ? parseInt(newValue, 10) : newValue);

        // Validate input and update the product object
        if (field === 'price') {
            if (isNaN(processedValue)) {
                showAlert('السعر يجب أن يكون رقمًا صحيحًا.', 'error');
                e.target.textContent = initialValue; // Revert to old value
                return;
            }
            updatedProduct[backendField] = processedValue; // Update the price
        } else if (field === 'quantity') {
            if (isNaN(processedValue)) {
                showAlert('الكمية يجب أن تكون رقمًا صحيحًا.', 'error');
                e.target.textContent = initialValue; // Revert to old value
                return;
            }
            updatedProduct[backendField] = processedValue; // Update the quantity
        } else {
            updatedProduct[backendField] = processedValue; // Update other fields like name
        }

        try {
            console.log("Sending update request for productId:", productId);
            console.log("Updated data:", updatedProduct);
            const result = await productAPI.updateProduct(productId, updatedProduct);
            if (result.success) {
                // Update initial value for future edits
                if (field === 'price') {
                    e.target.textContent = parseFloat(newValue).toFixed(2);
                } else {
                    e.target.textContent = newValue;
                }
                // No need to fetchProducts, as the change is already reflected in the cell
                // You might want a small visual feedback here, e.g., a temporary highlight
            } else {
                e.target.textContent = initialValue; // Revert on error
                showAlert(result.message || `حدث خطأ أثناء تحديث حقل ${field}.`, 'error');
            }
        } catch (error) {
            console.error(`Error updating product ${field}:`, error);
            e.target.textContent = initialValue; // Revert on error
            showAlert('حدث خطأ في الاتصال بالخادم.', 'error');
        }
    });

    // Handle Enter key to save changes
    cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent new line
            e.target.blur(); // Trigger blur event to save
        }
    });
}

// إضافة منتج جديد
async function handleAddProduct(event) {
    event.preventDefault();

    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('productQuantity').value, 10);

    if (!name || isNaN(price) || isNaN(quantity)) {
        showAlert('يرجى إدخال جميع البيانات بشكل صحيح', 'error');
        return;
    }

    const newProduct = { Name: name, Price: price, Quantity: quantity }; // Use PascalCase

    try {
        const result = await productAPI.createProduct(newProduct);

        if (result.success) {
            document.getElementById('addProductForm').reset();
            fetchProducts();
        } else {
            throw new Error(result.message || 'حدث خطأ أثناء إضافة المنتج');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showAlert(error.message, 'error');
    }
}

// تعديل المنتج (تمت إزالته لأننا نستخدم التعديل المباشر)
// async function editProduct(product) {
//     ...
// }

// حذف المنتج
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const result = await productAPI.deleteProduct(productId);

        if (result.success) {
            fetchProducts();
        } else {
            throw new Error(result.message || 'حدث خطأ أثناء حذف المنتج');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showAlert(error.message, 'error');
    }
}

// دالة عرض الرسائل باستخدام Bootstrap
function showAlert(message, type = 'success') {
    const alertBox = document.createElement('div');
    alertBox.className = `alert alert-${type === 'success' ? 'success' : 'danger'} position-fixed bottom-0 end-0 m-3`;
    alertBox.textContent = message;
    alertBox.style.zIndex = 9999;
    document.body.appendChild(alertBox);

    setTimeout(() => alertBox.remove(), 3000);
}
