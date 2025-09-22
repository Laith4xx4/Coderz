// API Configuration
import { API_CONFIG, getApiUrl } from './config.js';

// const API_BASE_URL = getApiUrl(); // استخدام دالة getApiUrl من config.js
const LOCAL_STORAGE_KEY = 'products_data';

// Product Data Structure
class Product {
    constructor(name, price, quantity, id = null) {
        this.id = id || Date.now();
        this.name = name;
        this.price = parseFloat(price);
        this.quantity = parseInt(quantity);
        this.createdAt = new Date().toISOString();
    }
}

// API Service Class
class ProductAPI {
    constructor() {
        this.baseURL = getApiUrl('BASE_URL') + API_CONFIG.PRODUCTS_URL;
    }

    // Helper method for API calls with retry logic
    async makeRequest(endpoint, options = {}, retryCount = 0) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const defaultOptions = {
                headers: {
                    ...API_CONFIG.DEFAULT_HEADERS,
                },
                signal: AbortSignal.timeout(API_CONFIG.TIMEOUT)
            };

            const token = localStorage.getItem('jwtToken');
            if (token) {
                defaultOptions.headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            return text ? JSON.parse(text) : {};
        } catch (error) {
            console.error(`API request failed (attempt ${retryCount + 1}):`, error);
            
            // Retry logic for network errors
            if (retryCount < API_CONFIG.MAX_RETRIES && 
                (error.name === 'AbortError' || error.message.includes('Failed to fetch'))) {
                
                console.log(`Retrying request in ${API_CONFIG.RETRY_DELAY}ms...`);
                await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
                return this.makeRequest(endpoint, options, retryCount + 1);
            }
            
            throw error;
        }
    }

    // Create new product
    async createProduct(productData) {
        try {
            const response = await this.makeRequest('', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
            
            return {
                success: true,
                data: response,
                message: 'تم إضافة المنتج بنجاح'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'حدث خطأ أثناء إضافة المنتج'
            };
        }
    }

    // Get all products
    async getProducts() {
        try {
            const response = await this.makeRequest('');
            
            return {
                success: true,
                data: response,
                message: 'تم جلب البيانات بنجاح'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'حدث خطأ أثناء جلب البيانات'
            };
        }
    }

    // Get product by ID
    async getProductById(id) {
        try {
            const response = await this.makeRequest(`/${id}`);
            
            return {
                success: true,
                data: response,
                message: 'تم جلب المنتج بنجاح'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'حدث خطأ أثناء جلب المنتج'
            };
        }
    }

    // Update product
    async updateProduct(id, productData) {
        try {
            const response = await this.makeRequest(`/${id}`, {
                method: 'PUT',
                body: JSON.stringify(productData)
            });
            
            return {
                success: true,
                data: response,
                message: 'تم تحديث المنتج بنجاح'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'حدث خطأ أثناء تحديث المنتج'
            };
        }
    }

    // Delete product
    async deleteProduct(id) {
        try {
            const response = await this.makeRequest(`/${id}`, {
                method: 'DELETE'
            });
            
            return {
                success: true,
                data: response,
                message: 'تم حذف المنتج بنجاح'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'حدث خطأ أثناء حذف المنتج'
            };
        }
    }

    // Search products
    async searchProducts(query) {
        try {
            // Get all products and filter locally since API might not support search
            const allProducts = await this.getProducts();
            
            if (!allProducts.success) {
                throw new Error(allProducts.message);
            }
            
            const filteredProducts = allProducts.data.filter(product =>
                product.Name.toLowerCase().includes(query.toLowerCase()) ||
                product.ProductId.toString().includes(query)
            );
            
            return {
                success: true,
                data: filteredProducts,
                message: `تم العثور على ${filteredProducts.length} منتج`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'حدث خطأ أثناء البحث'
            };
        }
    }

    // Get products statistics
    async getStatistics() {
        try {
            const allProducts = await this.getProducts();
            
            if (!allProducts.success) {
                throw new Error(allProducts.message);
            }
            
            const products = allProducts.data;
            const totalProducts = products.length;
            const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
            const averagePrice = totalProducts > 0 ? totalValue / totalProducts : 0;
            const lowStockProducts = products.filter(product => product.quantity < 10);
            
            return {
                success: true,
                data: {
                    totalProducts,
                    totalValue: totalValue.toFixed(2),
                    averagePrice: averagePrice.toFixed(2),
                    lowStockProducts: lowStockProducts.length
                },
                message: 'تم جلب الإحصائيات بنجاح'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'حدث خطأ أثناء جلب الإحصائيات'
            };
        }
    }

    // Export data
    async exportData() {
        try {
            const allProducts = await this.getProducts();
            
            if (!allProducts.success) {
                throw new Error(allProducts.message);
            }
            
            const dataStr = JSON.stringify(allProducts.data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `products_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            
            return {
                success: true,
                message: 'تم تصدير البيانات بنجاح'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'حدث خطأ أثناء تصدير البيانات'
            };
        }
    }

    // Import data
    async importData(file) {
        try {
            return new Promise(async (resolve, reject) => {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        
                        if (Array.isArray(importedData)) {
                            let successCount = 0;
                            let errorCount = 0;
                            
                            for (const product of importedData) {
                                try {
                                    await this.createProduct({
                                        name: product.name,
                                        price: product.price,
                                        quantity: product.quantity
                                    });
                                    successCount++;
                                } catch (error) {
                                    errorCount++;
                                    console.error('Error importing product:', error);
                                }
                            }
                            
                            resolve({
                                success: true,
                                message: `تم استيراد ${successCount} منتج بنجاح${errorCount > 0 ? ` (${errorCount} فشل)` : ''}`
                            });
                        } else {
                            reject(new Error('تنسيق الملف غير صحيح'));
                        }
                    } catch (error) {
                        reject(new Error('خطأ في قراءة الملف'));
                    }
                };
                reader.onerror = () => reject(new Error('خطأ في قراءة الملف'));
                reader.readAsText(file);
            });
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'حدث خطأ أثناء استيراد البيانات'
            };
        }
    }
}

// Authentication API Service Class
class AuthAPI {
    constructor() {
        this.baseURL = getApiUrl('BASE_URL'); // Using the base URL from config.js
        this.loginEndpoint = API_CONFIG.LOGIN_URL; // Path to login endpoint
        this.registerEndpoint = API_CONFIG.REGISTER_URL; // Path to register endpoint
    }

    async makeRequest(endpoint, options = {}, retryCount = 0) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const defaultOptions = {
                headers: {
                    ...API_CONFIG.DEFAULT_HEADERS,
                },
                signal: AbortSignal.timeout(API_CONFIG.TIMEOUT)
            };
            
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Handle cases where response might be empty (e.g., 204 No Content)
            const text = await response.text();
            const data = text ? JSON.parse(text) : {};

            // Store token in localStorage if available
            if (data.token) {
                localStorage.setItem('jwtToken', data.token);
                localStorage.setItem('userRole', data.role); // Assuming role is also returned
            }

            return data;
        } catch (error) {
            console.error(`Auth API request failed (attempt ${retryCount + 1}):`, error);
            
            if (retryCount < API_CONFIG.MAX_RETRIES && 
                (error.name === 'AbortError' || error.message.includes('Failed to fetch'))) {
                
                console.log(`Retrying auth request in ${API_CONFIG.RETRY_DELAY}ms...`);
                await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
                return this.makeRequest(endpoint, options, retryCount + 1);
            }
            
            throw error;
        }
    }

    async register(userData) {
        try {
            // Add a default role 'User' if not explicitly provided in userData
            const response = await this.makeRequest(this.registerEndpoint, {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            
            return {
                success: true,
                data: response,
                message: 'User registered successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error during user registration'
            };
        }
    }

    async login(credentials) {
        try {
            const response = await this.makeRequest(this.loginEndpoint, {
                method: 'POST',
                body: JSON.stringify(credentials)
            });

            console.log('Login API Response:', response); // Add this line to inspect the response

            // Extract role from response data, default to 'مستخدم' if not found
            const userRole = response && response.role ? response.role : 'مستخدم';

            return {
                success: true,
                data: response,
                message: `تم تسجيل الدخول بنجاح كـ ${userRole}`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error during user login'
            };
        }
    }
}


// Initialize API instance
export const productAPI = new ProductAPI();
export const authAPI = new AuthAPI(); // Initialize AuthAPI

// Export for use in other files
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = { ProductAPI, Product, productAPI, AuthAPI, authAPI };
// }
export { ProductAPI, Product, AuthAPI };
