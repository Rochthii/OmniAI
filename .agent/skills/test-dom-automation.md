# SKILL: KIỂM THỬ DOM AUTOMATION & FALLBACK

Kỹ năng hướng dẫn kiểm tra độ ổn định của Automation Layer khi tương tác với các trang Web AI.

## Các kịch bản kiểm thử bắt buộc:

1. **Kiểm thử Luồng Thành công (Happy Path)**:
   - Mở sẵn một tab Web AI (đã đăng nhập).
   - Chọn văn bản -> Bấm `Alt + A` -> Bấm Send.
   - Kiểm tra: Tab AI được focus, prompt được điền vào ô chat và nút gửi sẵn sàng.

2. **Kiểm thử Luồng Mở Tab Mới (Cold Start)**:
   - Chưa mở tab AI nào trước đó.
   - Bấm Send -> Tab AI mới được mở.
   - Chờ trang web load xong -> Kiểm tra automation có tự động inject sau khi DOM ready không.

3. **Kiểm thử Luồng Fallback (DOM Changed / Not Ready)**:
   - Giả lập Selector bị sai hoặc trang web không phản hồi trong 4 giây.
   - Kiểm tra: 
     - Toast thông báo: *"Không thể tự động điền. Đã copy vào Clipboard!"*.
     - Dữ liệu trong Clipboard có đầy đủ `Prompt + Context` hay không.
