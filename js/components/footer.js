export function renderFooter({ productLinks, supportLinks }) {
    const productLinksMarkup = productLinks.map((item) => `<a href="${item.href}">${item.label}</a>`).join('');
    const supportLinksMarkup = supportLinks.map((item) => `<a href="${item.href}">${item.label}</a>`).join('');

    return `
        <footer>
            <div class="container">
                <div class="footer-grid">
                    <div class="footer-col">
                        <a href="#" class="logo footer-logo">
                            i<span>Luxury</span>
                        </a>
                        <p>Hệ thống bán lẻ các sản phẩm Apple chính hãng với dịch vụ đẳng cấp, mang đến trải nghiệm mua sắm công nghệ vượt trội và tin cậy.</p>
                        <p class="footer-contact"><i data-lucide="map-pin"></i> 123 Nguyễn Huệ, Quận 1, TP. HCM</p>
                        <p class="footer-contact"><i data-lucide="phone"></i> 1800 1234 (Miễn phí)</p>
                    </div>

                    <div class="footer-col">
                        <h4>Sản phẩm</h4>
                        <div class="footer-links">
                            ${productLinksMarkup}
                        </div>
                    </div>

                    <div class="footer-col">
                        <h4>Hỗ trợ</h4>
                        <div class="footer-links">
                            ${supportLinksMarkup}
                        </div>
                    </div>

                    <div class="footer-col">
                        <h4>Nhận tin ưu đãi</h4>
                        <p>Đăng ký để nhận thông tin về các ưu đãi đặc biệt và sản phẩm mới nhất từ iLuxury.</p>
                        <form class="newsletter-form" onsubmit="event.preventDefault();">
                            <input type="email" placeholder="Email của bạn..." required>
                            <button type="submit" aria-label="Đăng ký nhận tin"><i data-lucide="send"></i></button>
                        </form>
                    </div>
                </div>

                <div class="footer-bottom">
                    <div class="copyright">
                        &copy; 2026 iLuxury. Đã đăng ký bản quyền.
                    </div>
                    <div class="social-links">
                        <a href="#"><i data-lucide="facebook"></i></a>
                        <a href="#"><i data-lucide="message-circle"></i></a>
                        <a href="#"><i data-lucide="instagram"></i></a>
                        <a href="#"><i data-lucide="youtube"></i></a>
                    </div>
                </div>
            </div>
        </footer>
    `;
}
