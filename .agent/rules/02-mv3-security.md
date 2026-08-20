# MANIFEST V3 & SECURITY GUIDELINES

## 1. Quyền hạn tối thiểu (Least Privilege)
- Chỉ xin các permissions thực sự cần thiết trong `manifest.json`:
  - `storage`: Lưu trữ preferences, blacklist, history cục bộ.
  - `activeTab`: Lấy ngữ cảnh tab hiện tại khi người dùng bấm phím tắt/icon.
  - `tabs`: Mở tab mới tới AI Provider.
  - `clipboardWrite`: Hỗ trợ tính năng sao chép tự động (fallback).
- **Không dùng `eval()` hoặc dynamically generated code** (vi phạm CSP của Chrome MV3).

## 2. Bảo mật Ngữ cảnh & Quyền riêng tư (Privacy Guard)
- **Blacklist Domain**: Không thu thập dữ liệu trên các domain nhạy cảm (Banking, Password Managers, Localhost private configs nếu user cấu hình).
- **Zero Remote Exfiltration**: Tuyệt đối không gửi dữ liệu `OmniContext` đến bất kỳ máy chủ bên thứ ba nào. Toàn bộ dòng dữ liệu chỉ luân chuyển giữa trang người dùng đang xem và tab Web AI mà người dùng chỉ định.
- **Graceful Error on Restricted URLs**: Bắt lỗi và thông báo thân thiện khi người dùng kích hoạt extension trên các trang bị trình duyệt cấm (`chrome://*`, `chrome-extension://*`, `edge://*`, Chrome Web Store).
