# PHASE 4: HARDENING, EDGE CASES & RELEASE PACKAGING

> **Mục tiêu:** Xử lý triệt để các trường hợp biên (Restricted pages, thẻ nhạy cảm/password, domain cấm), tối ưu hóa hiệu năng, xây dựng hệ thống lưu trữ cấu hình người dùng và đóng gói bản phát hành v0.1 hoàn chỉnh.

---

## DANH SÁCH MICRO-TASKS CHI TIẾT

### 🔒 Nhóm 4.1: Privacy Guard & Xử lý Ngoại lệ
- [ ] **Task 4.1.1: Bảo vệ Dữ liệu Nhạy cảm (Input & Password Guard)**
  - **File:** `src/privacy/guard.ts`
  - **Hành động:**
    - Kiểm tra nếu vùng bôi đen nằm trong thẻ `<input type="password">` hoặc trường nhạy cảm (`data-private="true"`) -> Từ chối trích xuất và hiển thị thông báo bảo vệ dữ liệu.
- [ ] **Task 4.1.2: Xử lý Trang Cấm Trình duyệt (Restricted URLs)**
  - **File:** `src/content/restricted-handler.ts`
  - **Hành động:**
    - Nếu người dùng kích hoạt trên `chrome://*`, `edge://*`, hoặc Chrome Web Store: Không gây crash Service Worker, hiển thị badge thông báo hệ thống không thể chạy trên trang nội bộ của trình duyệt.

---

### ⚙️ Nhóm 4.2: Lưu trữ Cấu hình Người dùng (User Preferences)
- [ ] **Task 4.2.1: Storage Manager**
  - **File:** `src/shared/storage.ts`
  - **Hành động:**
    - Quản lý các cấu hình trong `chrome.storage.local`:
      - `defaultProvider`: "chatgpt" | "claude" | "gemini"
      - `companionWidth`: Mặc định 460px
      - `theme`: "dark" | "light" | "system"
      - `customPrompts`: Danh sách các prompt nhanh do người dùng tự tạo.
- [ ] **Task 4.2.2: Options / Settings Page Đơn Giản**
  - **File:** `src/ui/options/OptionsPage.tsx`
  - **Hành động:** Giao diện cho phép người dùng tùy chỉnh kích thước cửa sổ Mini Companion và quản trị các nút Quick Actions.

---

### 🚀 Nhóm 4.3: Đóng gói Bản Phát hành v0.1 & Kiểm thử Tổng thể
- [ ] **Task 4.3.1: Type-check & Code Audit**
  - **Hành động:** Chạy `npm run type-check`, rà soát 100% codebase để đảm bảo không còn console debug bừa bãi, không có TODO giả lập.
- [ ] **Task 4.3.2: Đóng gói Production Build**
  - **Hành động:** Chạy `npm run build` và kiểm tra thư mục `dist/`.
- [ ] **Task 4.3.3: Nghiệm thu Definition of Done (DoD 10/10)**
  - **Hành động:** Thực hiện kiểm thử toàn bộ 10 tiêu chí theo Master Spec trên Google Chrome và Microsoft Edge.

---

## 🎯 MILESTONE 4 - RELEASE CANDIDATE (v0.1.0)
- Hoàn thành đầy đủ 10/10 tiêu chí DoD.
- Extension chạy ổn định, giao diện mượt mà, bảo mật tuyệt đối.
- Sẵn sàng xuất file zip để sử dụng thực tế hàng ngày!
