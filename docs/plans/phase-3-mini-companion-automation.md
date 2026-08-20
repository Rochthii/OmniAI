# PHASE 3: PROVIDER ADAPTER & MINI COMPANION AUTOMATION

> **Mục tiêu:** Xây dựng tầng Provider Adapter (định dạng prompt theo mẫu Markdown chuẩn cho ChatGPT), triển khai cơ chế Automation đưa dữ liệu vào ô chat của ChatGPT Mini Window và kích hoạt hệ thống tự động Fallback sao chép vào Clipboard khi DOM Automation thất bại.

---

## DANH SÁCH MICRO-TASKS CHI TIẾT

### 🤖 Nhóm 3.1: Provider Architecture & Prompt Template
- [ ] **Task 3.1.1: Định nghĩa Provider Interfaces**
  - **File:** `src/providers/types.ts`
  - **Hành động:**
    ```ts
    export interface AIProvider {
      id: string;
      name: string;
      baseUrl: string;
      capabilities: {
        maxContextChars: number;
        supportsVision: boolean;
        supportsAutomation: boolean;
      };
      formatPrompt(context: OmniContext, userPrompt: string): string;
    }
    ```
- [ ] **Task 3.1.2: Xây dựng ChatGPT Web Adapter**
  - **File:** `src/providers/chatgpt.ts`
  - **Hành động:**
    - Cấu hình: `baseUrl = "https://chatgpt.com/"`, `maxContextChars = 30000`.
    - Mẫu Markdown Prompt Template chuẩn:
      ```markdown
      {USER_PROMPT}

      ---
      ### 📌 Context Information:
      - **Source:** [{TITLE}]({URL})
      - **Language/Type:** {TYPE} ({LANGUAGE})
      
      ```{LANGUAGE}
      {CONTENT}
      ```
      ```
- [ ] **Task 3.1.3: Xây dựng Provider Registry**
  - **File:** `src/providers/registry.ts`
  - **Hành động:** Quản lý danh sách Provider (ChatGPT, và sẵn sàng cho Claude/Gemini sau này), lấy default provider.

---

### ⚡ Nhóm 3.2: Mini Companion DOM Automation
- [ ] **Task 3.2.1: Content Script tiêm vào ChatGPT Mini Window**
  - **File:** `src/automation/providers/chatgpt-injector.ts`
  - **Hành động:**
    - Định danh các selector của ChatGPT:
      - `#prompt-textarea` (Contenteditable div / Textarea)
      - `div[contenteditable="true"]`
      - Nút gửi: `button[data-testid="send-button"]`, `button[aria-label="Send prompt"]`.
    - Viết logic mô phỏng sự kiện gõ phím chuẩn React (React Synthetic Events):
      ```ts
      function injectTextToEditor(element: HTMLElement, text: string): boolean;
      ```
- [ ] **Task 3.2.2: Automation Executor & Timeout Race Condition**
  - **File:** `src/automation/executor.ts`
  - **Hành động:**
    - Khi nhận lệnh `INJECT_PROMPT`:
    - Chờ DOM sẵn sàng (Polling tối đa 3500ms).
    - Nếu tìm thấy và inject thành công -> Báo status `SUCCESS`.
    - Nếu quá 3500ms không tìm thấy DOM (hoặc chưa đăng nhập) -> Báo status `FAILED` kèm lý do timeout.

---

### 📋 Nhóm 3.3: First-Class Clipboard Fallback Strategy
- [ ] **Task 3.3.1: Clipboard Copy Utility**
  - **File:** `src/automation/clipboard.ts`
  - **Hành động:**
    - Triển khai hàm `copyPromptToClipboard(text: string)`.
    - Gọi ghi clipboard ngay tại Content Script khi user bấm Send (trước khi chuyển tab/window) để đảm bảo quyền truy cập Clipboard API.
- [ ] **Task 3.3.2: Toast Notification Handler**
  - **File:** `src/ui/shared/Toast.tsx`
  - **Hành động:**
    - Nếu Automation thành công: Toast xanh: *"Đã đưa ngữ cảnh vào ChatGPT Mini!"*.
    - Nếu Automation fallback: Toast vàng: *"Đã sao chép vào Clipboard! Nhấn Ctrl + V trong cửa sổ ChatGPT để gửi."*.

---

## 🎯 MILESTONE 3 - CRITERIA OF ACCEPTANCE (DoD)
1. Chọn 1 đoạn văn bản bất kỳ -> Bấm `Alt + A` -> Chọn Action "Tóm tắt" -> Bấm Send.
2. Cửa sổ ChatGPT Mini 460px mở lên bên phải màn hình.
3. Nội dung Markdown đầy đủ gồm User Prompt + Tiêu đề + URL + Đoạn text được tự động điền vào ô chat của ChatGPT.
4. Trường hợp giả lập DOM bị lỗi: Clipboard máy tính đã có sẵn nội dung, chỉ cần bấm `Ctrl + V` là dán vào ngay lập tức.
