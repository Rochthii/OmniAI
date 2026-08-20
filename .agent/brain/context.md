# OMNIAI - PROJECT BRAIN & CONTEXT

## 1. Bản chất & Tầm nhìn Dự án
OmniAI là một cầu nối ngữ cảnh (Context Bridge) và trợ lý AI song song (Side-by-Side Companion) chạy trực tiếp trên trình duyệt (Manifest V3 Extension).
- **Trọng tâm UX**: **Mini Companion Window** (Cửa sổ AI thu nhỏ 460px nép sát mép phải màn hình), giúp người dùng vừa đọc tài liệu vừa nhận câu trả lời từ AI mà không cần chuyển qua lại giữa các tab lớn.
- **Triết lý**: Local-First, Zero Backend, Không cần API Key, Tự động Fallback sang Clipboard nếu DOM Automation bị gián đoạn.

## 2. Tech Stack
- **Framework & Runtime**: Manifest V3 (Chrome, Edge, Brave, Arc)
- **Tooling**: Vite + TypeScript + React
- **UI Architecture**: Shadow DOM (`mode: 'open'`) cho Spotlight HUD; Native Popup Window (`460px`) cho Mini Companion.
- **Message Bus**: Type-safe Chrome Runtime Messaging.

## 3. Kiến trúc Luồng Dữ liệu
```text
Bôi đen / Xem trang
        │
     Alt + A
        ▼
Content Script (Trích xuất DOM & Metadata)
        │
        ▼
   OmniContext (Đóng gói, đếm ký tự, kiểm tra Truncate)
        │
        ▼
Shadow DOM HUD (Preview, chọn Action/Prompt, toggle components)
        │
      [Send]
        ▼
Background Worker (Mở hoặc Focus Mini Companion Window 460px bên phải)
        │
   ┌────┴────────────────────────┐
   │                             │
Automation Injector      Clipboard Fallback
(Thử điền vào DOM AI)    (Sao chép prompt vào Clipboard)
```

## 4. Trạng thái hiện tại
- **Phase**: Phase 1 - Scaffolding & Core Architecture Setup.
- **Master Spec**: Version 1.0 (Frozen - Focus on Mini Companion).
