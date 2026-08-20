# ADR 0004: Mini Companion Window (Cửa sổ AI Thu Nhỏ Cạnh Màn Hình)

## Bối cảnh
Người dùng thường xuyên phải chuyển đổi qua lại giữa tab tài liệu đang đọc và tab ChatGPT lớn, làm phân mảnh sự tập trung. Việc nhúng ChatGPT trực tiếp vào trang web qua `<iframe>` bị chặn bởi chính sách bảo mật của các nhà cung cấp AI (`X-Frame-Options: DENY` / `Content-Security-Policy`).

## Quyết định
Sử dụng Chrome Windows API (`chrome.windows.create`) với chế độ `type: 'popup'` để tạo ra một **Mini Companion Window**:
1. **Kích thước & Vị trí**: Rộng 460px, cao 100% màn hình, tự động neo sát mép phải (`left = screen.availWidth - 460`).
2. **Loại bỏ UI thừa**: Cửa sổ dạng popup ẩn toàn bộ thanh địa chỉ (URL bar), thanh bookmark và tab bar, mang lại trải nghiệm như một ứng dụng Native Widget độc lập.
3. **Singleton Pattern**: Lưu trữ `companionWindowId` trong Service Worker để tái sử dụng cửa sổ hiện có, tránh tạo ra nhiều cửa sổ rác khi người dùng gửi nhiều prompt liên tiếp.

## Hệ quả
- **Tích cực**:
  - Người dùng có trải nghiệm Side-by-Side (vừa đọc tài liệu bên trái, vừa xem AI trả lời bên phải).
  - Không vi phạm chính sách CSP hay X-Frame-Options của Web AI.
  - Tận dụng 100% phiên đăng nhập và giao diện chính thức của ChatGPT/Claude.
- **Tiêu cực**: Cần quản lý vòng đời đóng/mở của cửa sổ (lắng nghe sự kiện `chrome.windows.onRemoved` để reset `companionWindowId`).
