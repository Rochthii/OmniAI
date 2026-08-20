# CODING STANDARDS - OMNIAI

## 1. TypeScript & Type Safety
- **Strict Mode**: Bật `strict: true` trong `tsconfig.json`. Không sử dụng kiểu `any` tùy tiện, bắt buộc định nghĩa interface/type tường minh.
- **Type Co-location**: Các types dùng chung nằm trong `src/shared/types.ts` hoặc các module tương ứng (`src/context/types.ts`, `src/providers/types.ts`).
- **Immutability**: Tránh mutate trực tiếp objects/arrays; ưu tiên pure functions khi biến đổi `OmniContext`.

## 2. Chrome Extension & Manifest V3
- **Decoupled Architecture**: 
  - `Content Script`: Chỉ làm nhiệm vụ trích xuất DOM/Selection, hiển thị Shadow DOM UI và lắng nghe phím tắt.
  - `Background Service Worker`: Xử lý message passing, quản lý tabs, lưu trữ cấu hình qua `chrome.storage.local`.
  - `Automation Layer`: Quản lý logic tương tác web AI và clipboard fallback.
- **Communication Protocol**: Sử dụng Type-safe Message Passing pattern:
  ```ts
  export interface ExtensionMessage<T = unknown> {
    type: MessageType;
    payload: T;
  }
  ```

## 3. UI & Styling Isolation
- **Shadow DOM**: Mọi Floating UI/HUD tiêm vào trang web của người dùng BẮT BUỘC nằm trong Shadow Root (`mode: 'open'`) để cô lập 100% CSS, không làm vỡ giao diện trang web gốc và không bị CSS trang web ghi đè.
- **Clean Styling**: Không dùng thư viện CSS quá nặng; ưu tiên Vanilla CSS / CSS Modules hoặc Tailwind (nếu cấu hình nhúng vào Shadow Root).
