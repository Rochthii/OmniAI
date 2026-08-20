# ADR 0001: Phân tách Provider Adapter và Automation Layer

## Bối cảnh
Các giải pháp tích hợp AI trên trình duyệt thường gộp chung logic định nghĩa AI (URL, prompt) với logic tương tác DOM (selectors, injection). Điều này khiến hệ thống dễ vỡ khi các nhà cung cấp AI (OpenAI, Anthropic, Google) thay đổi cấu trúc giao diện web.

## Quyết định
Tách biệt hoàn toàn hai tầng:
1. **Provider Adapter**: Chỉ chịu trách nhiệm về metadata, capabilities, và định dạng prompt.
2. **Automation Layer**: Chịu trách nhiệm về hành vi duyệt trình duyệt, tìm kiếm phần tử DOM, kích hoạt sự kiện và cơ chế fallback.

## Hệ quả
- **Tích cực**: Khi ChatGPT thay đổi DOM, chỉ cần cập nhật file automation tương ứng mà không làm ảnh hưởng đến cấu trúc Provider và Context Engine.
- **Tiêu cực**: Cần thêm một tầng điều phối (Executor) để kết nối Provider và Automation.
