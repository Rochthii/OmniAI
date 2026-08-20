# TASK BOARD - OMNIAI

> **Lộ trình chi tiết:** Xem tại [docs/plans/00-roadmap.md](../../docs/plans/00-roadmap.md)

---

## 🟢 ĐÃ HOÀN THIỆN ĐẦY ĐỦ 100% CÁC PHASES (v0.1.0)

### ✅ Phase 1: Extension Skeleton & Mini Companion Launcher
- [x] Task 1.1.1 -> 1.1.3: Cài đặt Tooling, TypeScript Strict, Manifest V3, Vite + CRXJS.
- [x] Task 1.2.1 -> 1.2.2: Hệ thống Message Bus 2 chiều Type-safe (`src/shared/messaging/bus.ts`).
- [x] Task 1.3.1 -> 1.3.2: Singleton Mini Companion Window Manager 460px (`src/background/companion-manager.ts`).
- [x] Task 1.4.1 -> 1.4.2: Content Script & Phím tắt `Alt + A` (`src/content/content-script.ts`).

### ✅ Phase 2: Context Engine & Shadow DOM Spotlight HUD
- [x] Task 2.1.1 -> 2.1.5: Context Extraction Engine (Selection, Metadata, Language detection, Token estimation).
- [x] Task 2.2.1 -> 2.2.2: Shadow DOM Isolation Layer cô lập CSS 100%.
- [x] Task 2.3.1 -> 2.3.4: Spotlight HUD React Component (Quick Actions, Prompt Input, Esc/Enter shortcuts).

### ✅ Phase 3: Multi-Provider Adapter & Automation Layer
- [x] Task 3.1.1 -> 3.1.3: Hỗ trợ đa AI (ChatGPT, Claude, Gemini).
- [x] Task 3.2.1 -> 3.2.3: DOM Automation Injector với React Synthetic Events.
- [x] Task 3.3.1 -> 3.3.2: First-Class Clipboard Fallback Strategy + Toast Notification.

### ✅ Phase 4: Hardening, Privacy & Toolbar Settings
- [x] Task 4.1.1 -> 4.1.2: Privacy Guard (Chặn password inputs & sensitive domains).
- [x] Task 4.2.1 -> 4.2.2: Toolbar Action Popup UI (`src/ui/popup/`) với cài đặt AI mặc định.
- [x] Task 4.3.1 -> 4.3.3: Production Build `dist/` thành công không có lỗi.
