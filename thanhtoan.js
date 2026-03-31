document.addEventListener("DOMContentLoaded", function () {
    // 1. Khai báo các phần tử DOM
    const btnOrder = document.querySelector(".btn-order");
    const paymentSelect = document.getElementById("payment-select");
    const totalAmountElem = document.getElementById("total-amount");
    
    const qrModal = document.getElementById("qrModal");
    const qrImage = document.getElementById("qr-image");
    const qrAmount = document.getElementById("qr-amount");
    const qrDesc = document.getElementById("qr-desc");
    const closeBtn = document.querySelector(".close-qr");

    // Thông tin tài khoản nhận tiền (Thay đổi theo ý bạn)
    const BANK_ID = "vietcombank"; // Mã ngân hàng (vietcombank, acb, mb...)
    const ACCOUNT_NO = "123456789";
    const ACCOUNT_NAME = "NGUYEN VAN A";

    // 2. Xử lý khi nhấn nút Đặt Hàng
    btnOrder.addEventListener("click", function () {
        const paymentMethod = paymentSelect.value;
        const totalValue = totalAmountElem.innerText.replace(/\./g, ""); // Xóa dấu chấm để lấy số
        const orderId = "DH" + Math.floor(Math.random() * 100000); // Tạo mã đơn hàng ngẫu nhiên

        if (paymentMethod === "Chuyển khoản ngân hàng") {
            showQRModal(totalValue, orderId);
        } else {
            alert("Chúc mừng! Đơn hàng " + orderId + " đã được đặt thành công (Thanh toán COD).");
            // window.location.href = "thankyou.html"; // Chuyển hướng nếu cần
        }
    });

    // 3. Hàm hiển thị Modal QR
    function showQRModal(amount, desc) {
        // Cập nhật text trong Modal
        qrAmount.innerText = parseInt(amount).toLocaleString("vi-VN");
        qrDesc.innerText = desc;

        // Tạo link QR từ VietQR (Dịch vụ miễn phí)
        // Cấu trúc: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<NAME>
        const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(desc)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;
        
        qrImage.src = qrUrl;
        
        // Hiển thị Modal
        qrModal.style.display = "flex";
    }

    // 4. Các hàm đóng Modal
    window.closeQR = function() {
        qrModal.style.display = "none";
        alert("Cảm ơn bạn! Hệ thống sẽ kiểm tra giao dịch và liên hệ sớm nhất.");
    };

    closeBtn.onclick = function() {
        qrModal.style.display = "none";
    };

    // Đóng khi click ra ngoài vùng modal
    window.onclick = function(event) {
        if (event.target == qrModal) {
            qrModal.style.display = "none";
        }
    };
});