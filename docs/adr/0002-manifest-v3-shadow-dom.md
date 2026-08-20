# ADR 0002: Sử dụng Shadow DOM cho Giao diện Tiêm (Injected UI)

## Bối cảnh
Khi chèn Floating Trigger hoặc Modal vào trang web của người dùng, CSS của trang web có thể ghi đè làm hỏng giao diện Extension, hoặc ngược lại, CSS của Extension có thể làm vỡ layout của trang web gốc.

## Quyết định
Tất cả các thành phần UI của OmniAI được render bên trong một **Shadow Root** (`attachShadow({ mode: 'open' })`).

## Hệ quả
- **Tích cực**: Cô lập CSS 100%, bảo vệ giao diện của cả Extension và trang web.
- **Tiêu cực**: Việc nhúng font và style bên ngoài cần được đưa trực tiếp vào Shadow Root thay vì thẻ `<head>` của document.
