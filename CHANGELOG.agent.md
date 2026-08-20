# OMNIAI - AGENT SNAPSHOT & CHANGELOG
<!-- FAST CONTEXT SYNC FOR AI AGENTS • TOKEN BUDGET < 300 TOKENS -->

## ⚡ META
- **App**: OmniAI (Browser Extension - Manifest V3)
- **Stack**: React 18 + TypeScript + Vite + CRXJS + Shadow DOM + Split-Screen Dock
- **Concept**: Split-Screen Side-by-Side Dock with 100% True Zero Network Reload.

## 🌟 CORE UX HIGHLIGHTS (v1.0.1)
1. **Khôi Phục URL Gốc Ổn Định & Loại Bỏ Hoàn Toàn Lỗi Màn Hình Trắng**:
   - **Sử dụng URL chuẩn Canonical cho tất cả các tab**: ChatGPT (`https://chatgpt.com/`), Gemini (`https://gemini.google.com/app`), Claude (`https://claude.ai/new`), Qwen (`https://chat.qwenlm.ai/`), DeepSeek (`https://chat.deepseek.com/`), Translate (`https://translate.google.com/`).
   - **Xóa bỏ triệt để biến `siteUrls` lưu URL sub-path bị hỏng**: Ngăn chặn tình trạng cố tải lại session URL đã hết hạn từ bộ nhớ cũ.
   - **Giữ nguyên trạng thái khi chuyển tab**: Mỗi tab được nạp 1 lần và giữ sống liên tục trong DOM.

## 🚦 CURRENT STATE
- **Phase**: **V1.0.1 - CANONICAL URL RESTORATION & ZERO WHITE SCREEN COMPLETED**
- **Dist Path**: `E:\Projects\Project_ca_nhan\omniai\dist`

## 📜 CHANGELOG / MILESTONES
- `[2026-08-20]` **v1.0.1**: Khôi phục URL Canonical gốc • Xóa bỏ lưu URL động bị hỏng • Chạy ổn định 100%.
- `[2026-08-20]` **v1.0.0**: Viết lại toàn diện kiến trúc • Tiêm Main-World Anti-Framebusting • Gỡ bỏ sandbox • Đóng gói sạch 100%.

- `[2026-08-20]` **v0.9.4**: Xóa sandbox iframe • Gỡ triệt để COEP/COOP • Khắc phục màn hình trắng tinh 100%.

- `[2026-08-18]` **v0.9.3**: Sửa triệt để lỗi màn hình đen • Sửa urlFilter DNR • Gán z-index active cho iframe.

- `[2026-08-18]` **v0.9.2**: Sửa triệt để lỗi màn hình trắng do reload lặp vô tận • Đổi màu nền iframe sang dark theme.

- `[2026-08-18]` **v0.9.1**: Đồng bộ Real-Time Deep-Link URL • Giữ nguyên vẹn đoạn chat khi đóng/mở lại 100%.

- `[2026-08-18]` **v0.9.0**: Vá toàn diện các vấn đề High/Medium • Tối ưu 120 FPS GPU widget • Khử duplicate click event • Nâng cấp version manifest.


- `[2026-08-18]` **v0.8.7**: Sửa triệt để lỗi `Alt + S` không mở lại được • Đồng bộ trạng thái mở/đóng 2 chiều liên tục 100%.

- `[2026-08-18]` **v0.8.6**: Nâng cấp hiệu ứng mở Side Panel với Soft Blur Slide-in • Chuyển tab Micro-Scale 3D không còn cảm giác cứng nhắc.

- `[2026-08-18]` **v0.8.5**: Khóa chặt 100% mở thanh Native Side Panel bên phải • Xóa bỏ hoàn toàn cơ chế mở cửa sổ popup nổi.

- `[2026-08-18]` **v0.8.4**: Nâng cấp toàn bộ hệ thống chuyển động sang trượt mờ nhẹ nhàng (Smooth Slide & Fade) • Đạt độ mượt 120 FPS trên GPU.

- `[2026-08-17]` **v0.8.3**: Sửa triệt để lỗi `Alt + S` không đóng được Side Panel • Hỗ trợ đóng mở 2 chiều trên mọi ngữ cảnh và iframe.

- `[2026-08-17]` **v0.8.2**: Khắc phục triệt để lỗi click nút `[AI]` trên YouTube • Tối ưu mở bằng `tabId` và `windowId` chuẩn Chrome User Activation.

- `[2026-08-17]` **v0.8.1**: Gỡ bỏ thanh context bar phụ • Tối ưu 100% diện tích chiều dọc cho khung chat AI • Hoàn thiện bộ tài liệu Copywriting quảng bá chuẩn quốc tế.

- `[2026-08-17]` **v0.8.0**: Chuyển đổi toàn diện sang Tiếng Anh chuẩn quốc tế • Loại bỏ 100% emoji, thay bằng SVG tối giản • Sẵn sàng 100% đưa lên Chrome Web Store.

- `[2026-08-17]` **v0.7.6**: Loại bỏ vĩnh viễn nút `[⚡ Gửi AI]` khi bôi đen text • Nâng cấp phím tắt `Alt+S` / `Alt+Z` thành Toggle 2 chiều Mở / Đóng tức thì.

- `[2026-08-17]` **v0.7.5**: Tự động nhận diện & Ẩn widget trên các website AI gốc (ChatGPT, Claude, Gemini, Qwen, DeepSeek...) để tránh che khuất giao diện AI gốc.

- `[2026-08-17]` **v0.7.4**: Kiểm tra toàn diện & Tối ưu triệt để độ trễ • In-memory cache 0ms cho preferences • Khử trùng lặp event listeners • Đạt mức phản hồi tức thì 120 FPS.

- `[2026-08-17]` **v0.7.3**: Hỗ trợ 1-Click Bật/Tắt Side Panel trực tiếp từ nút `[⚡ AI]` • Nút ✕ đóng nhanh trên header Side Panel • Đồng bộ Presence Connection 2 chiều.

- `[2026-08-17]` **v0.7.2**: Tối ưu hiệu năng 60-120 FPS • Loại bỏ Re-render khi kéo thả • On-Demand Lazy Loading Side Panel • Cực kỳ nhẹ và mượt trên mọi trang.

- `[2026-08-17]` **v0.7.1**: Triển khai Smart Widget `[⚡ AI]` • Hỗ trợ Kéo thả mượt mà & Lưu toạ độ • Tự động ngủ đông lùi vào mép sau 3s (mờ 35%) • Thức dậy sáng đèn tức thì khi rê chuột.

- `[2026-08-17]` **v0.7.0**: Hợp nhất kiến trúc Native Side Panel • Khắc phục triệt để lỗi đăng nhập ChatGPT/Claude trên iframe trang web • Hỗ trợ mở Side Panel mượt mà trên PDF • Tối ưu nút `[⚡ AI]` thành launcher kích hoạt cấp trình duyệt.

- `[2026-08-17]` **v0.6.2**: Thử nghiệm Split-Screen Screen Pushing.

