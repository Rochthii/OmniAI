# PHASE 2: CONTEXT ENGINE & SHADOW DOM SPOTLIGHT HUD

> **Mục tiêu:** Xây dựng bộ máy trích xuất ngữ cảnh (`OmniContext`), đo lường độ dài/tokens, phát hiện ngôn ngữ code và hiển thị giao diện nổi Spotlight HUD (Shadow DOM) tại trang web để người dùng xem preview và chỉnh sửa prompt trước khi gửi.

---

## DANH SÁCH MICRO-TASKS CHI TIẾT

### 🧠 Nhóm 2.1: Context Extraction Engine
- [ ] **Task 2.1.1: Định nghĩa Models & Types cho Ngữ cảnh**
  - **File:** `src/context/types.ts`
  - **Hành động:** Định nghĩa `OmniContext`, `SourceMetadata`, `ContextMetrics`, `ContextType`.
- [ ] **Task 2.1.2: Trích xuất Text Bôi đen (Selection Extractor)**
  - **File:** `src/context/extractors/selection.ts`
  - **Hành động:**
    - Sử dụng `window.getSelection()?.toString().trim()`.
    - Lấy vị trí tọa độ vùng bôi đen (`getRangeAt(0).getBoundingClientRect()`).
    - Kiểm tra xem đoạn văn bản được chọn có nằm trong thẻ `<code>`, `<pre>` hay các editor (Monaco, CodeMirror) hay không.
- [ ] **Task 2.1.3: Trích xuất Metadata Nguồn (Metadata Extractor)**
  - **File:** `src/context/extractors/metadata.ts`
  - **Hành động:**
    - Trích xuất: `document.title`, `window.location.href`, `window.location.hostname`.
    - Lấy favicon (`link[rel~='icon']`).
    - Lấy thẻ canonical URL nếu có.
- [ ] **Task 2.1.4: Nhận diện Ngôn ngữ Lập trình (Language Detector)**
  - **File:** `src/context/extractors/language-detector.ts`
  - **Hành động:**
    - Phân tích cú pháp cơ bản hoặc đọc class name của thẻ `code` (ví dụ: `class="language-typescript"`).
    - Đọc đuôi file từ URL (ví dụ: `.ts`, `.py`, `.rs`, `.go` trên GitHub/GitLab).
- [ ] **Task 2.1.5: Đóng gói Context & Tính toán Truncation**
  - **File:** `src/context/context-engine.ts`
  - **Hành động:**
    - Tổng hợp dữ liệu thành `OmniContext`.
    - Tính `charCount = content.length`.
    - Tính `estimatedTokens = Math.ceil(charCount / 3.5)`.
    - Nếu `charCount > maxBudget` (mặc định 20.000 ký tự): Cắt ngắn văn bản, gán `isTruncated = true` và lưu `originalCharCount`.

---

### 🛡️ Nhóm 2.2: Shadow DOM Isolation Layer
- [ ] **Task 2.2.1: Quản lý Shadow Host**
  - **File:** `src/ui/shadow-root.ts`
  - **Hành động:**
    - Tạo thẻ `<div id="omniai-spotlight-host">` gắn vào `document.body`.
    - Gắn Shadow Root: `host.attachShadow({ mode: 'open' })`.
    - Chèn CSS Reset chuẩn (ngăn 100% style của trang web tác động vào UI).
- [ ] **Task 2.2.2: Mount React Application**
  - **File:** `src/ui/mount.tsx`
  - **Hành động:** Khởi tạo React Root (`ReactDOM.createRoot`) bên trong Shadow Root.

---

### 🎨 Nhóm 2.3: Spotlight HUD React Component
- [ ] **Task 2.3.1: Component Khung Spotlight HUD**
  - **File:** `src/ui/spotlight/SpotlightModal.tsx`
  - **Hành động:**
    - Thiết kế cửa sổ nổi nằm chính giữa màn hình (hoặc neo gần vị trí con trỏ).
    - Backdrop mờ nhẹ, hỗ trợ phím `Esc` để đóng nhanh.
    - Hiệu ứng xuất hiện mượt mà (smooth fade/scale).
- [ ] **Task 2.3.2: Thanh Quick Actions (Gợi ý hành động nhanh)**
  - **File:** `src/ui/spotlight/QuickActions.tsx`
  - **Hành động:**
    - Các nút hành động 1-click:
      - 💡 **Giải thích** (`Explain this code/text simply...`)
      - 🐞 **Tìm lỗi & Fix** (`Find bugs and fix them...`)
      - 🔒 **Kiểm tra bảo mật** (`Audit security vulnerabilities...`)
      - 📝 **Tóm tắt ý chính** (`Summarize key takeaways...`)
      - 🌐 **Dịch sang tiếng Việt** (`Translate to Vietnamese...`)
- [ ] **Task 2.3.3: Ô nhập Prompt & Context Badges**
  - **File:** `src/ui/spotlight/PromptInput.tsx`, `src/ui/spotlight/ContextBadge.tsx`
  - **Hành động:**
    - Textarea auto-focus, cho phép user gõ prompt tùy ý.
    - Badge hiển thị: Domain nguồn, số ký tự, số tokens ước tính.
    - Badge cảnh báo màu cam nếu dữ liệu bị `Truncated`.
    - Checkbox bật/tắt: `[x] Text đã chọn`, `[x] URL nguồn`.
- [ ] **Task 2.3.4: Xử lý nút [Gửi sang AI]**
  - **File:** `src/ui/spotlight/SpotlightModal.tsx`
  - **Hành động:**
    - Khi bấm Send (hoặc ấn `Ctrl + Enter` / `Enter`):
    - Đóng HUD -> Gửi message `SEND_PROMPT_TO_COMPANION` kèm toàn bộ `OmniContext` + `userPrompt` sang Background Worker.

---

## 🎯 MILESTONE 2 - CRITERIA OF ACCEPTANCE (DoD)
1. Bôi đen 1 đoạn code trên GitHub.
2. Bấm `Alt + A`.
3. Spotlight HUD hiện lên ngay giữa trang web với giao diện chuyên nghiệp, không bị vỡ CSS bởi GitHub.
4. Preview hiển thị đúng: "GitHub • 450 chars • ~120 tokens • TypeScript".
5. Bấm chọn nút "Tìm lỗi & Fix" -> Prompt tự điền vào ô nhập.
6. Bấm Enter -> HUD đóng lại và payload sẵn sàng để đẩy sang Phase 3.
