# ADR 0003: Chiến lược Fallback qua Clipboard là First-Class Citizen

## Bối cảnh
DOM Automation trên các trang Web SPA phức tạp (như ChatGPT, Claude) vốn dĩ có độ rủi ro cao do thay đổi giao diện, Cloudflare Challenge hoặc hydration chậm. Nếu chỉ phụ thuộc vào DOM injection, trải nghiệm người dùng sẽ bị đứt gãy hoàn toàn khi injection thất bại.

## Quyết định
Xem tính năng **Sao chép vào Clipboard (Clipboard Copy)** là một phương án dự phòng hạng nhất (First-class Citizen):
1. Khi người dùng nhấn Send, dữ liệu đã được chuẩn bị sẵn sàng để copy.
2. Nếu Automation không thể điền vào ô chat trong khoảng thời gian timeout quy định, hệ thống tự động ghi nội dung vào Clipboard và mở tab AI.
3. Hiển thị thông báo Toast hướng dẫn người dùng nhấn `Ctrl + V`.

## Hệ quả
- **Tích cực**: Không bao giờ làm mất dữ liệu hoặc làm nghẽn dòng suy nghĩ (flow) của người dùng.
- **Tiêu cực**: Cần xin quyền `clipboardWrite` trong Manifest V3.
