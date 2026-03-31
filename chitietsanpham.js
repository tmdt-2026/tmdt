document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. KHAI BÁO CÁC PHẦN TỬ CHUNG ---
    const mainImg = document.getElementById('main-img');
    const thumbnails = document.querySelectorAll('.thumbnail-list img');
    const capacityBtns = document.querySelectorAll('.btn-option');
    const colorDots = document.querySelectorAll('.color-dot');

    // Tìm chính xác thẻ <p> dựa trên nội dung để tránh nhầm lẫn
    let colorLabel, capacityLabel;
    const allLabels = document.querySelectorAll('.option-group p');
    
    allLabels.forEach(p => {
        if (p.innerText.includes("Màu")) colorLabel = p;
        if (p.innerText.includes("Dung lượng")) capacityLabel = p;
    });

    // Mapping dữ liệu màu sắc
    const colorMap = {
        'black':  { name: 'Đen', img: '/ip15plus.jpg' },
        'blue':   { name: 'Xanh dương', img: '/ip15blue.jpg' },
        'green':  { name: 'Xanh lá', img: '/ip15green.jpg' },
        'yellow': { name: 'Vàng', img: '/ip15plus-yellow.jpg' },
        'pink':   { name: 'Hồng', img: '/ip15plus-pink.jpg' }
    };

    // --- 2. XỬ LÝ CHỌN DUNG LƯỢNG ---
    capacityBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Xóa active cũ, thêm active mới
            capacityBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Cập nhật text hiển thị ngay trên phần chọn dung lượng
            if (capacityLabel) {
                const val = this.innerText;
                capacityLabel.innerHTML = `Dung lượng: <strong>${val}</strong>`;
            }
            console.log("Đã chọn dung lượng: " + this.innerText);
        });
    });

    // --- 3. XỬ LÝ CHỌN MÀU SẮC ---
    colorDots.forEach(dot => {
        dot.addEventListener('click', function() {
            // Cập nhật trạng thái Active cho chấm màu
            colorDots.forEach(d => d.classList.remove('active'));
            this.classList.add('active');

            // Lấy class màu (ví dụ: 'blue') và tra cứu trong colorMap
            const colorClass = this.classList[1]; 
            const colorData = colorMap[colorClass];

            if (colorData) {
                // Cập nhật text hiển thị ngay trên phần chọn màu
                if (colorLabel) {
                    colorLabel.innerHTML = `Màu: <strong>${colorData.name}</strong>`;
                }
                
                // Đổi ảnh chính và tạo hiệu ứng mờ nhẹ (Smooth transition)
                if (mainImg) {
                    mainImg.style.opacity = '0.7';
                    mainImg.src = colorData.img;
                    setTimeout(() => mainImg.style.opacity = '1', 150);
                }
            }
        });
    });

    // --- 4. XỬ LÝ CLICK ẢNH PHỤ (THUMBNAILS) ---
    if (thumbnails.length > 0) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                if (mainImg) mainImg.src = this.src;
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

});
    // 4. Nút mua ngay
    document.querySelector('.btn-buy-now').addEventListener('click', function() {
        const selectedCapacity = document.querySelector('.btn-option.active').innerText;
        alert("Cảm ơn bạn! Đã thêm iPhone 15 Plus bản " + selectedCapacity + " vào giỏ hàng.");
    });


document.addEventListener('DOMContentLoaded', function() {
    const checkboxes = document.querySelectorAll('.acc-checkbox');
    const totalPriceEl = document.getElementById('total-price');
    const buyBtn = document.getElementById('buy-btn');
    
    const MAIN_PRODUCT_PRICE = 18990000;

    function updateBundle() {
        let total = MAIN_PRODUCT_PRICE;
        let count = 1; // iPhone là 1

        checkboxes.forEach(cb => {
            if (cb.checked) {
                total += parseInt(cb.getAttribute('data-price'));
                count++;
                cb.parentElement.classList.add('active');
            } else {
                cb.parentElement.classList.remove('active');
            }
        });

        // Cập nhật hiển thị tiền (định dạng VND)
        totalPriceEl.innerText = total.toLocaleString('vi-VN') + '₫';
        
        // Cập nhật chữ trên nút bấm
        buyBtn.innerText = `Mua ${count} sản phẩm`;
    }

    checkboxes.forEach(cb => {
        cb.addEventListener('change', updateBundle);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const likeBtn = document.querySelector('.btn-like');
    let likeCount = 48;
    let isLiked = false;

    likeBtn.addEventListener('click', function() {
        if (!isLiked) {
            likeCount++;
            this.innerHTML = `<i class="fa-solid fa-thumbs-up"></i> Hữu ích (${likeCount})`;
            this.style.fontWeight = 'bold';
            isLiked = true;
        } else {
            likeCount--;
            this.innerHTML = `<i class="fa-regular fa-thumbs-up"></i> Hữu ích (${likeCount})`;
            this.style.fontWeight = 'normal';
            isLiked = false;
        }
    });

    // Xử lý nút viết đánh giá
    document.querySelector('.btn-write-review').addEventListener('click', function() {
    });
});

document.addEventListener('DOMContentLoaded', function () {
    // 1. Lấy các phần tử cần thiết
    const modal = document.getElementById("reviewModal");
    const openBtn = document.querySelector(".btn-write-review");
    const closeBtn = document.querySelector(".close-btn");
    const stars = document.querySelectorAll(".star-rating span");
    const submitBtn = document.querySelector(".submit-btn");

    // 2. Mở Modal khi bấm vào nút "Viết đánh giá"
    openBtn.onclick = function () {
        modal.style.display = "block";
        document.body.style.overflow = "hidden"; // Chặn cuộn trang web khi đang mở modal
    }

    // 3. Đóng Modal khi bấm vào nút (X)
    closeBtn.onclick = function () {
        modal.style.display = "none";
        document.body.style.overflow = "auto"; // Cho phép cuộn trang lại
    }

    // 4. Đóng Modal khi bấm ra ngoài vùng nội dung trắng
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        }
    }

    // 5. Xử lý chọn sao đánh giá
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            // Xóa màu vàng ở tất cả các sao
            stars.forEach(s => s.style.color = "#ccc");
            
            // Tô màu vàng cho các sao từ trái sang đến sao được chọn
            for (let i = 0; i <= index; i++) {
                stars[i].style.color = "#ff9800";
            }
            
            // Lưu giá trị số sao vào một thuộc tính tùy chỉnh (nếu cần gửi đi)
            modal.setAttribute('data-rating', index + 1);
            console.log("Bạn đã chọn: " + (index + 1) + " sao");
        });
    });

    // 6. Xử lý nút "Gửi đánh giá"
    submitBtn.onclick = function() {
        const comment = modal.querySelector("textarea").value;
        const name = modal.querySelectorAll(".input-group input")[0].value;
        const phone = modal.querySelectorAll(".input-group input")[1].value;
        const rating = modal.getAttribute('data-rating') || 0;

        if(!name || !phone || !comment) {
            alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
            return;
        }

        alert(`Cảm ơn ${name}! Đánh giá ${rating} sao của bạn đã được gửi thành công.`);
        
        // Sau khi gửi xong thì đóng modal và xóa nội dung
        modal.style.display = "none";
        document.body.style.overflow = "auto";
        modal.querySelector("textarea").value = "";
    }
});

