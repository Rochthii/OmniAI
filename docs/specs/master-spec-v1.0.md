# MASTER SPECIFICATION v1.0 (FROZEN) - OMNIAI

## 1. Mục tiêu & Phạm vi (Scope)
Xây dựng một Extension trên trình duyệt (Manifest V3) đóng vai trò là cầu nối ngữ cảnh giữa nội dung người dùng đang duyệt và các dịch vụ Web AI (ChatGPT, Claude, Gemini).
- 100% Client-side, không backend, không lưu trữ từ xa, không telemetry.
- Hỗ trợ phím tắt kích hoạt nhanh (`Alt + A`) mở Floating Spotlight HUD.
- Đóng gói dữ liệu thành chuẩn `OmniContext`.
- **Trải nghiệm Trọng tâm (Mini Companion):** Tự động mở/focus cửa sổ AI thu nhỏ (460px) nép sát mép phải màn hình để làm việc song song (Side-by-side).
- Tự động điền dữ liệu vào giao diện Web AI và có cơ chế Fallback Clipboard thông minh.

---

## 2. Chuẩn dữ liệu `OmniContext`
```ts
export interface OmniContext {
  id: string; // crypto.randomUUID()
  createdAt: number;

  source: {
    url: string;
    title: string;
    domain: string;
    favicon?: string;
  };

  type: "selection" | "article" | "code" | "document";

  metadata?: {
    language?: string;
    filename?: string;
  };

  content: string;

  metrics: {
    charCount: number;
    estimatedTokens: number;
    isTruncated: boolean;
    originalCharCount?: number;
  };
}
```

---

## 3. Kiến trúc Hệ thống

### 3.1. Phân tách Trách nhiệm (Decoupled Architecture)
* **Provider Layer (`src/providers/`)**: Chịu trách nhiệm định nghĩa AI nào, định dạng prompt như thế nào, giới hạn dung lượng context budget.
* **Automation Layer (`src/automation/`)**: Chịu trách nhiệm đưa dữ liệu vào AI (tìm DOM input, trigger event, kiểm tra timeout, fallback sang Clipboard).
* **Companion Window Manager (`src/background/companion.ts`)**: Quản lý vòng đời Singleton Window (tạo cửa sổ 460px sát mép phải, reuse tab, focus window).

### 3.2. Luồng Xử lý Dữ liệu (Data Flow)
```text
Bôi đen nội dung trên trang bất kỳ
               ↓
            Alt + A
               ↓
Floating HUD xuất hiện tại chỗ (Shadow DOM)
               ↓
User chọn Quick Action hoặc nhập prompt + xem Context Preview
               ↓
          Bấm [Send]
               ↓
Service Worker kiểm tra & kích hoạt Mini Companion Window (460px bên phải)
               ↓
Automation Layer injects dữ liệu vào ChatGPT Mini Window
       ├── SUCCESS: Hiển thị kết quả ngay trong cửa sổ mini
       └── TIMEOUT / FAIL: Tự động copy vào Clipboard + Báo Toast "Ctrl+V để gửi"
```

---

## 4. Definition of Done (DoD) cho Phiên bản v0.1

| #  | Tiêu chí | Trạng thái |
| -- | -------- | ---------- |
| 1  | Extension cài đặt & load unpacked được trên Chrome / Edge | Chưa |
| 2  | Nhấn `Alt + A` kích hoạt được Floating Modal trên mọi trang web hợp lệ | Chưa |
| 3  | Bắt chính xác đoạn text được bôi đen và metadata trang (URL, Title) | Chưa |
| 4  | Tạo đối tượng `OmniContext` chuẩn chỉnh | Chưa |
| 5  | Modal hiển thị Preview ngữ cảnh và cảnh báo nếu bị cắt ngắn (Truncated) | Chưa |
| 6  | Người dùng có thể tùy chỉnh prompt và bật/tắt các trường ngữ cảnh | Chưa |
| 7  | **Mở/Focus đúng cửa sổ Mini Companion (460px) nép sát mép phải màn hình** | Chưa |
| 8  | Thử nghiệm inject prompt + context vào ô chat của ChatGPT Mini Window | Chưa |
| 9  | Tự động fallback sao chép vào Clipboard nếu DOM injection thất bại | Chưa |
| 10 | Hoàn toàn không có server backend, không API token, không telemetry | Đạt |
