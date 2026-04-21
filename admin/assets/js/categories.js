/**
 * Quản lý danh mục thiết bị - Microservice Port 3004
 * Đã tối ưu: Tự động load dữ liệu khi Tab hiển thị
 */

const CategoryModule = {
  API_URL: "http://localhost:3004/api/v1/products/categories",
  categories: [],
  editingCategoryId: null,

  // 1. Lấy dữ liệu từ Server
  async fetchCategories() {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) throw new Error("Server disconnected");
      const result = await response.json();

      // Xử lý bọc data từ NestJS ResponseInterceptor
      this.categories = Array.isArray(result) ? result : result.data || [];

      this.updateStats();
      return this.categories;
    } catch (error) {
      console.error("❌ API Error:", error);
      return [];
    }
  },

  // 2. Cập nhật các con số thống kê trên UI
  updateStats() {
    const total = document.getElementById("categoryTotalCount");
    const active = document.getElementById("categoryActiveCount");
    const child = document.getElementById("categoryChildCount");

    if (total) total.innerText = this.categories.length;
    if (active)
      active.innerText = this.categories.filter(
        (c) => c.isActive !== false,
      ).length;
    if (child)
      child.innerText = this.categories.filter((c) => c.parentId).length;
  },

  // 3. Render danh sách
  async renderCategoriesList() {
    const grid = document.getElementById("categoryGrid");
    if (!grid) return;

    // Trạng thái Skeleton/Loading khi vừa nhấn vào Tab
    grid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <div class="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-4"></div>
                <p class="text-slate-400 font-black uppercase tracking-widest text-[10px]">Đang đồng bộ dữ liệu...</p>
            </div>`;

    await this.fetchCategories();
    const filtered = this.getFilteredCategories();

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="col-span-full py-20 text-center text-slate-400 font-bold italic">Không có dữ liệu danh mục.</div>`;
      return;
    }

    grid.innerHTML = filtered
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map(
        (category) => `
                <div class="group bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300">
                    <div class="flex items-start justify-between">
                        <div class="flex gap-4">
                            <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <i data-lucide="${category.parentId ? "tag" : "folder-tree"}" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-slate-800 tracking-tight">${category.name}</h3>
                                <p class="text-[10px] text-slate-400 font-bold uppercase">ID: ${category.id}</p>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <p class="text-[9px] uppercase font-black text-slate-400 mb-1 tracking-widest">Danh mục cha</p>
                        <span class="text-xs font-bold ${category.parentId ? "text-blue-600" : "text-slate-500"} italic">
                            ${this.getCategoryNameById(category.parentId)}
                        </span>
                    </div>
                    <div class="mt-5 flex gap-2">
                        <button onclick="CategoryModule.editCategory('${category.id}')" class="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-blue-600">Sửa</button>
                        <button onclick="CategoryModule.deleteCategory('${category.id}')" class="px-3 py-2.5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            `,
      )
      .join("");

    this.renderCategoryParentOptions();
    if (window.lucide) lucide.createIcons();
  },
  async deleteCategory(id) {
    // Hiển thị hộp thoại xác nhận trước khi xóa
    if (
      !confirm(
        `⚠️ Bạn có chắc chắn muốn xóa danh mục này (ID: ${id})?\nLưu ý: Không thể xóa nếu danh mục đang chứa sản phẩm.`,
      )
    ) {
      return;
    }

    try {
      // Gọi API DELETE tới Microservice
      const response = await fetch(`${this.API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        // Nếu server trả về lỗi (ví dụ lỗi khóa ngoại do còn sản phẩm)
        throw new Error(result.message || "Không thể xóa danh mục này.");
      }

      // Thông báo thành công và làm mới danh sách
      console.log(`✅ Đã xóa danh mục ${id}`);
      await this.renderCategoriesList();
    } catch (error) {
      console.error("❌ Delete Error:", error);
      alert("Lỗi: " + error.message);
    }
  },
  // 4. API Thêm/Sửa
  async saveCategory() {
    const name = document.getElementById("categoryName").value.trim();
    const parentId = document.getElementById("categoryParent").value || null;
    const sortOrder = Number(
      document.getElementById("categorySort").value || 0,
    );

    if (!name) return alert("Vui lòng nhập tên danh mục!");

    const payload = {
      name: name,
      parentId: parentId,
      sortOrder: sortOrder,
      slug: this.generateSlug(name),
    };

    const method = this.editingCategoryId ? "PATCH" : "POST";
    const url = this.editingCategoryId
      ? `${this.API_URL}/${this.editingCategoryId}`
      : this.API_URL;

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        this.closeCategoryForm();
        await this.renderCategoriesList();
      }
    } catch (e) {
      alert("Lỗi kết nối server!");
    }
  },

  // --- HELPERS ---
  getCategoryNameById(id) {
    if (!id) return "Danh mục gốc";
    const cat = this.categories.find((c) => String(c.id) === String(id));
    return cat ? cat.name : "N/A";
  },

  getFilteredCategories() {
    const search =
      document.getElementById("categorySearch")?.value?.toLowerCase() || "";
    return this.categories.filter((c) => c.name.toLowerCase().includes(search));
  },

  renderCategoryParentOptions() {
    const select = document.getElementById("categoryParent");
    if (!select) return;
    select.innerHTML =
      `<option value="">Không có danh mục cha</option>` +
      this.categories
        .filter((c) => String(c.id) !== String(this.editingCategoryId))
        .map((c) => `<option value="${c.id}">${c.name}</option>`)
        .join("");
  },

  editCategory(id) {
    const cat = this.categories.find((c) => String(c.id) === String(id));
    if (!cat) return;
    this.editingCategoryId = id;
    document.getElementById("categoryFormTitle").textContent = "Sửa danh mục";
    document.getElementById("categoryName").value = cat.name;
    document.getElementById("categoryParent").value = cat.parentId || "";
    document.getElementById("categorySort").value = cat.sortOrder || 0;
    document.getElementById("categoryFormBox").classList.remove("hidden");
  },

  openCategoryForm() {
    this.editingCategoryId = null;
    document.getElementById("categoryFormTitle").textContent =
      "Thêm danh mục mới";
    document.getElementById("categoryName").value = "";
    document.getElementById("categoryParent").value = "";
    document.getElementById("categorySort").value = 0;
    document.getElementById("categoryFormBox").classList.remove("hidden");
  },

  closeCategoryForm() {
    document.getElementById("categoryFormBox").classList.add("hidden");
  },

  generateSlug(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  },
};

// --- LOGIC TỰ ĐỘNG LOAD KHI CLICK ---
window.initCategoryTab = () => CategoryModule.renderCategoriesList();

// Theo dõi nếu tab này được hiển thị (dùng MutationObserver)
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("categoryGrid");
  if (grid) {
    CategoryModule.renderCategoriesList();
  }
});

window.CategoryModule = CategoryModule;
