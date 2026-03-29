export class CartManager {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
    }

    addItem(product) {
        const nextId = String(product.id || Date.now());
        const existingItem = this.items.find(item => String(item.id) === nextId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: nextId,
                title: product.title,
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.image,
                quantity: 1
            });
        }
        this.save();
    }

    removeItem(itemId) {
        const targetId = String(itemId);
        this.items = this.items.filter(item => String(item.id) !== targetId);
        this.save();
    }

    updateQuantity(itemId, quantity) {
        const targetId = String(itemId);
        const item = this.items.find(i => String(i.id) === targetId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.save();
        }
    }

    getItems() {
        return this.items;
    }

    getTotals() {
        return this.items.reduce(
            (acc, item) => {
                const originalTotal = parseInt(item.originalPrice?.replace(/[^\d]/g, '') || item.price.replace(/[^\d]/g, ''));
                const currentTotal = parseInt(item.price.replace(/[^\d]/g, ''));
                return {
                    original: acc.original + originalTotal * item.quantity,
                    current: acc.current + currentTotal * item.quantity
                };
            },
            { original: 0, current: 0 }
        );
    }

    clear() {
        this.items = [];
        this.save();
    }

    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }
}

export const cartManager = new CartManager();
