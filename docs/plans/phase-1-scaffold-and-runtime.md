# PHASE 1: EXTENSION SKELETON & MINI COMPANION LAUNCHER

> **Mục tiêu:** Xây dựng khung runtime Manifest V3 hoàn chỉnh, thiết lập hệ thống giao tiếp type-safe giữa Content Script và Background Service Worker, cài đặt phím tắt `Alt + A` và quản lý cửa sổ Mini Companion (460px) nép sát mép phải màn hình.

---

## DANH SÁCH MICRO-TASKS CHI TIẾT

### 📦 Nhóm 1.1: Thiết lập Môi trường & Tooling Build
- [ ] **Task 1.1.1: Khởi tạo dependencies**
  - **File:** `package.json`
  - **Hành động:** Kiểm tra và cài đặt packages: `react`, `react-dom`, `@types/chrome`, `@crxjs/vite-plugin`, `vite`, `typescript`.
  - **Tiêu chuẩn kiểm chứng:** Chạy `npm install` thành công, không xung đột dependency.
- [ ] **Task 1.1.2: Cấu hình Manifest V3**
  - **File:** `manifest.config.ts`
  - **Hành động:** Định nghĩa metadata extension:
    - Name: "OmniAI - Context Bridge & Companion"
    - Permissions: `["storage", "activeTab", "windows", "tabs", "clipboardWrite"]`
    - Host Permissions: `["https://chatgpt.com/*", "https://*.chatgpt.com/*"]`
    - Background Service Worker: `src/background/service-worker.ts`
    - Content Scripts: `src/content/content-script.ts` trên `<all_urls>`
    - Action Popup / Icon assets.
  - **Tiêu chuẩn kiểm chứng:** File sinh ra manifest hợp lệ chuẩn schema MV3.
- [ ] **Task 1.1.3: Cấu hình Vite & TypeScript**
  - **File:** `vite.config.ts`, `tsconfig.json`
  - **Hành động:** Thiết lập CRXJS plugin với Vite, cấu hình path alias `@/*` -> `src/*`.
  - **Tiêu chuẩn kiểm chứng:** Chạy `npm run build` xuất thư mục `dist/` có `manifest.json`.

---

### 📡 Nhóm 1.2: Hệ thống Giao tiếp Type-Safe (Messaging Bus)
- [ ] **Task 1.2.1: Định nghĩa Message Types**
  - **File:** `src/shared/types/messages.ts`
  - **Hành động:** Khai báo Discriminated Union cho tất cả các loại message:
    ```ts
    export type ExtensionMessage =
      | { type: 'PING' }
      | { type: 'PONG' }
      | { type: 'OPEN_COMPANION'; payload?: { url?: string } }
      | { type: 'COMPANION_READY'; payload: { windowId: number; tabId: number } }
      | { type: 'SEND_PROMPT_TO_COMPANION'; payload: { prompt: string } }
      | { type: 'INJECTION_STATUS'; payload: { success: boolean; error?: string } };
    ```
- [ ] **Task 1.2.2: Xây dựng Message Bus Utilities**
  - **File:** `src/shared/messaging/bus.ts`
  - **Hành động:** Tạo hàm bọc `sendToBackground<TResponse>()` và `sendToTab<TResponse>()` có xử lý try/catch và timeout nếu Service Worker đang ngủ (dormant).
  - **Tiêu chuẩn kiểm chứng:** Message gửi đi có type checking đầy đủ ở cả 2 đầu nhận/gửi.

---

### 🪟 Nhóm 1.3: Quản lý Cửa sổ Mini Companion (Singleton Window)
- [ ] **Task 1.3.1: Xây dựng Companion Manager**
  - **File:** `src/background/companion-manager.ts`
  - **Hành động:**
    - Quản lý biến trạng thái `companionWindowId: number | null`.
    - Hàm `getOrCreateCompanion(targetUrl?: string)`:
      - Tính toán tọa độ: `width = 460`, `left = screen.availWidth - 460`, `top = 0`, `height = screen.availHeight`.
      - Nếu `companionWindowId` tồn tại: gọi `chrome.windows.update(companionWindowId, { focused: true })`.
      - Nếu chưa tồn tại: gọi `chrome.windows.create({ url, type: 'popup', width, height, left, top, focused: true })`.
    - Lắng nghe `chrome.windows.onRemoved` để reset `companionWindowId = null` khi người dùng tắt cửa sổ.
  - **Tiêu chuẩn kiểm chứng:** Bấm nhiều lần chỉ mở duy nhất 1 cửa sổ mini, không sinh thêm tab/cửa sổ rác.
- [ ] **Task 1.3.2: Tích hợp vào Service Worker**
  - **File:** `src/background/service-worker.ts`
  - **Hành động:** Đăng ký listener `chrome.runtime.onMessage` để nhận `OPEN_COMPANION` và chuyển tiếp cho `CompanionManager`.

---

### ⌨️ Nhóm 1.4: Content Script & Phím tắt Lắng nghe
- [ ] **Task 1.4.1: Xây dựng Content Script Entry Point**
  - **File:** `src/content/content-script.ts`
  - **Hành động:** Khởi tạo khi trang web tải xong, in log kiểm tra runtime connection.
- [ ] **Task 1.4.2: Bắt sự kiện Phím tắt `Alt + A`**
  - **File:** `src/content/hotkey-listener.ts`
  - **Hành động:**
    - Lắng nghe sự kiện `keydown` trên `window`.
    - Kiểm tra tổ hợp phím `event.altKey && (event.code === 'KeyA' || event.key === 'a' || event.key === 'A')`.
    - Ngăn chặn hành vi mặc định nếu cần (`event.preventDefault()`).
    - Bắn message `OPEN_COMPANION` sang Background Worker để test thông luồng.
  - **Tiêu chuẩn kiểm chứng:** Nhấn `Alt + A` trên bất kỳ trang web nào, Service Worker nhận được tín hiệu và mở cửa sổ Mini Companion.

---

## 🎯 MILESTONE 1 - CRITERIA OF ACCEPTANCE (DoD)
1. Cài đặt được extension từ thư mục `dist/` vào Google Chrome (Load unpacked).
2. Mở một trang web bất kỳ (ví dụ: `https://github.com`).
3. Nhấn tổ hợp phím `Alt + A`.
4. Một cửa sổ popup ChatGPT mini rộng 460px xuất hiện ngay lập tức ở mép phải màn hình.
5. Nhấn `Alt + A` lần 2 -> Cửa sổ mini đó tự động được Focus lại mà không mở thêm cửa sổ mới.
