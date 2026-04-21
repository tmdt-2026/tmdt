/**
 * assets/js/products.js
 */

const InventoryModule = {
  // 1. Cấu hình Endpoint
  API_URL: "http://localhost:3004/api/v1/products",
  CATEGORY_API_URL: "http://localhost:3004/api/v1/products/categories",

  // --- GIỮ NGUYÊN PHẦN DANH MỤC CỦA BẠN ---
  async fetchCategoriesToSelect() {
    let selectEl = document.getElementById("p-category");
    let retryCount = 0;
    while (!selectEl && retryCount < 5) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      selectEl = document.getElementById("p-category");
      retryCount++;
    }

    if (!selectEl) {
      console.error("❌ Không thể tìm thấy thẻ <select id='p-category'> sau 5 lần thử.");
      return;
    }

    try {
      const response = await fetch(this.CATEGORY_API_URL);
      const result = await response.json();
      const categories = Array.isArray(result) ? result : result.data || [];

      let html = '<option value="" disabled selected>-- Chọn danh mục --</option>';
      categories.forEach((cat) => {
        html += `<option value="${cat.id}">${cat.name}</option>`;
      });

      selectEl.innerHTML = html;
      console.log("✅ Đã nạp danh mục vào Select Box.");
    } catch (error) {
      console.error("❌ Lỗi API Danh mục:", error);
    }
  },

  // 3. Lấy dữ liệu sản phẩm từ Database
  async fetchProductsFromDB() {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) throw new Error("Không thể kết nối đến server");
      const result = await response.json();
      return Array.isArray(result) ? result : result.data || [];
    } catch (error) {
      console.error("❌ Lỗi tải kho hàng:", error);
      return [];
    }
  },

  // 4. Render bảng sản phẩm
  async loadProducts() {
    const tbody = document.getElementById("product-table-body");
    const loader = document.getElementById("product-loading");
    if (!tbody) return;

    tbody.innerHTML = "";
    loader?.classList.remove("hidden");

    const products = await this.fetchProductsFromDB();
    loader?.classList.add("hidden");

    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-slate-400 italic font-medium">Kho hàng trống.</td></tr>`;
      return;
    }

    products.forEach((product) => {
      const variant = product.variants && product.variants[0] ? product.variants[0] : {};
      const price = variant.price ? Number(variant.price).toLocaleString() : "0";
      const stock = variant.stockQuantity || 0;
      const stockColor = stock <= 5 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600";

      tbody.innerHTML += `
                <tr class="text-sm hover:bg-slate-50 transition-colors border-b border-slate-100">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <img src="${product.imgUrl || "https://via.placeholder.com/40"}" class="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm">
                            <div>
                                <div class="font-bold text-slate-800">${product.name}</div>
                                <div class="text-[9px] text-slate-400 font-mono">ID: ${product.id}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">
                            ${product.category?.name || "N/A"}
                        </span>
                    </td>
                    <td class="px-6 py-4 font-black text-indigo-600">${price} ₫</td>
                    <td class="px-6 py-4">
                        <span class="px-3 py-1 rounded-full text-[10px] font-black ${stockColor}">
                            ${stock} đơn vị
                        </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="InventoryModule.deleteProduct('${product.id}')" class="w-8 h-8 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all ml-auto">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </td>
                </tr>
            `;
    });
    if (window.lucide) lucide.createIcons();
  },

  previewImage(event) {
    const file = event.target.files[0];
    const display = document.getElementById("image-preview-display");
    const placeholder = document.getElementById("image-preview-placeholder");
    const urlInput = document.getElementById("p-image-url");

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        display.src = e.target.result;
        urlInput.value = e.target.result; 
        display.classList.remove("hidden");
        placeholder.classList.add("hidden");
      };
      reader.readAsDataURL(file);
    }
  },

  async handleAddProduct(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    const name = document.getElementById("p-name").value.trim();
    const categoryId = document.getElementById("p-category").value;
    const modelId = document.getElementById("p-model").value.trim();
    const price = parseFloat(document.getElementById("p-price").value) || 0;
    const stock = parseInt(document.getElementById("p-stock").value) || 0;
    const imgUrl = document.getElementById("p-image-url").value;

    if (!name || !categoryId) {
      alert("Vui lòng nhập tên và chọn danh mục!");
      return;
    }

    const payload = {
      name: name,
      categoryId: String(categoryId),
      modelId: modelId ? String(modelId) : undefined,
      imgUrl: imgUrl || "https://via.placeholder.com/150",
      variants: [{
        color: "Tiêu chuẩn",
        ram: 0,
        storage: 0,
        importPrice: Math.round(price * 0.8),
        price: price,
        stockQuantity: stock,
        isActive: true,
        originalPrice: price
      }]
    };

    console.log("📤 Gửi Payload:", payload);

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = "Đang xử lý...";

      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        const errorDetail = Array.isArray(result.message) ? result.message.join(", ") : result.message;
        throw new Error(errorDetail || "Lỗi server");
      }

      console.log("✅ Thành công:", result);
      alert("✅ Nhập kho thành công!");
      e.target.reset();
      Utils.toggleModal("add-product-modal");
      this.loadProducts();
    } catch (error) {
      console.error("❌ Thất bại:", error.message);
      alert("Lỗi: " + error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  },

  async deleteProduct(id) {
    if (!confirm("Xóa thiết bị này?")) return;
    try {
      const response = await fetch(`${this.API_URL}/${id}`, { method: "DELETE" });
      if (response.ok) this.loadProducts();
    } catch (error) { console.error(error); }
  }
};

// --- FIX LỖI DOM: Lắng nghe sự kiện toàn cục ---
document.addEventListener("submit", (e) => {
  if (e.target && e.target.id === "add-product-form") {
    InventoryModule.handleAddProduct(e);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  InventoryModule.loadProducts();
  InventoryModule.fetchCategoriesToSelect();
});

window.InventoryModule = InventoryModule;