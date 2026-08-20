# SKILL: THÊM AI PROVIDER MỚI

Kỹ năng này hướng dẫn các bước tiêu chuẩn để thêm một AI Web Provider mới vào hệ thống (ví dụ: Claude, Gemini, DeepSeek).

## Các bước thực hiện:

1. **Tạo Provider Adapter**:
   - Tạo file trong `src/providers/<provider-id>.ts`.
   - Implement interface `AIProvider`:
     - `id`: Định danh duy nhất (ví dụ: `claude`, `gemini`).
     - `name`: Tên hiển thị.
     - `baseUrl`: Đường dẫn web của AI.
     - `capabilities`: Khai báo `maxContextChars`, `supportsVision`, `supportsAutomation`.
     - `formatPrompt(context: OmniContext, userPrompt: string): string`: Hàm đóng gói prompt chuẩn định dạng cho AI đó.

2. **Đăng ký vào Registry**:
   - Import và thêm provider mới vào `src/providers/registry.ts`.

3. **Xây dựng Automation Injector**:
   - Tạo file trong `src/automation/providers/<provider-id>.ts`.
   - Viết logic tìm DOM input của trang AI đó (selectors, input events).
   - Thiết lập cơ chế kiểm tra timeout (thường từ 3-5 giây).

4. **Kích hoạt Fallback**:
   - Đảm bảo nếu injector trả về `status: 'failed'`, `AutomationExecutor` sẽ tự động sao chép nội dung vào Clipboard.
