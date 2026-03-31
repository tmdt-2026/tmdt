// Cấu hình dữ liệu
const UNIT_PRICE = 540000; // Giá gốc của 1 sản phẩm

// 1. Hàm thay đổi số lượng và cập nhật giá
function changeQty(step) {
    const qtyInput = document.getElementById('quantity');
    const totalPriceElements = document.querySelectorAll('.total-price, .summary-row .price');
    let currentQty = parseInt(qtyInput.value);
    let newQty = currentQty + step;

    // Giới hạn số lượng tối thiểu là 1
    if (newQty < 1) return;
    qtyInput.value = newQty;

    // Tính toán tổng tiền
    const totalAmount = newQty * UNIT_PRICE;

    // Định dạng hiển thị tiền tệ VNĐ (ví dụ: 1.080.000₫)
    const formattedPrice = totalAmount.toLocaleString('vi-VN') + '₫';

    // Cập nhật lên giao diện ở cả 2 vị trí
    totalPriceElements.forEach(el => {
        el.innerText = formattedPrice;
    });

    // Cập nhật text Tạm tính
    const tamTinhText = document.querySelector('.total-row span:first-child');
    if (tamTinhText && tamTinhText.innerText.includes("Tạm tính")) {
        tamTinhText.innerText = `Tạm tính (${newQty} sản phẩm):`;
    }

}

// 2. Hàm đóng/mở phần nhập mã giảm giá
function togglePromo() {
    const promoInput = document.getElementById('promoInput');
    if (promoInput.style.display === 'none' || promoInput.style.display === '') {
        promoInput.style.display = 'flex';
    } else {
        promoInput.style.display = 'none';
    }
}

// 3. Tối ưu địa chỉ
document.addEventListener('DOMContentLoaded', () => {
    const provinceSelect = document.querySelector('.address');
    const districtSelect = document.querySelector('.district');

    // Dữ liệu mẫu (Lưu ý: Key ở đây phải khớp chính xác với Value trong thẻ <option> của HTML)
    const locations = {
        "Tp. Hồ Chí Minh": ["Quận 1", "Quận 3", "Quận 7", "P. Tân Định", "P. Bến Thành", "Huyện Hóc Môn"],
        "An Giang": ["P. Mỹ Xuyên", "P. Châu Phú A", "Huyện Tân Châu"],
        "Tp. Cần Thơ": ["Quận Ninh Kiều", "Quận Cái Răng", "Huyện Phong Điền"],
        "Tiền Giang": ["Tp. Mỹ Tho", "Huyện Gò Công", "Huyện Cái Bè"],
        "Hà Nội": ["Quận Hoàn Kiếm", "Quận Ba Đình", "Huyện Đông Anh"],
        "Bến Tre": ["Tp. Bến Tre", "Huyện Châu Thành", "Huyện Chợ Lách"],
        "Sóc Trăng": ["Tp. Sóc Trăng", "Huyện Mỹ Xuyên", "Xã Thạnh Quới"],
        "Cà Mau": ["Tp. Cà Mau", "Huyện U Minh", "Huyện Trần Văn Thời"]
    };

    // Hàm cập nhật danh sách Quận/Huyện dựa trên Tỉnh/TP
    function updateDistricts(provinceName) {
        districtSelect.innerHTML = '<option value="">Chọn Quận/Huyện</option>'; 
        
        // Lấy danh sách huyện từ object locations
        const districts = locations[provinceName];
        
        if (districts) {
            districts.forEach(dist => {
                const opt = document.createElement('option');
                opt.value = dist;
                opt.innerText = dist;
                districtSelect.appendChild(opt);
            });
        }
    }

    // Lắng nghe sự kiện thay đổi Tỉnh/TP
    provinceSelect.addEventListener('change', (e) => {
        // Lấy trực tiếp value từ option (Ví dụ: "Tp. Hồ Chí Minh")
        const selectedProvince = e.target.value; 
        updateDistricts(selectedProvince);
    });

    // Khởi tạo trạng thái mặc định cho Promo
    const promoInput = document.getElementById('promoInput');
    if(promoInput) promoInput.style.display = 'none';
});

document.querySelector('.btn-order').addEventListener('click', () => {
    // Lấy giá trị các trường
    const name = document.querySelector('input[placeholder="Họ và Tên"]').value.trim();
    const phoneInput = document.getElementById('phone'); // Đảm bảo bạn đã đặt id="phone" cho input SĐT
    const phone = phoneInput ? phoneInput.value.trim() : "";

    if (!name || !phone) {
        alert("Vui lòng nhập đầy đủ thông tin khi đặt hàng!");
        return;
    }

    const phoneRegex = /^[0-9]{10}$/; 
    if (!phoneRegex.test(phone)) {
        alert("Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số.");
        phoneInput.focus(); // Đưa con trỏ vào ô nhập lỗi
        return;
    }
    alert("Cảm ơn " + name + "! Đơn hàng của bạn đã được đặt.");
});

