# OMNIAI - IMPLEMENTATION ROADMAP

Tài liệu này định hình toàn bộ lộ trình triển khai dự án **OmniAI** từ v0.1 đến v1.0. Mỗi phase được thiết kế theo nguyên tắc **Vertical Slice** (mỗi phase đều có sản phẩm chạy được và kiểm chứng được trên trình duyệt thật).

---

## TỔNG QUAN CÁC PHASES

```text
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: Extension Skeleton & Mini Companion Launcher       │
│ • Vite + React + CRXJS + TypeScript Tooling                 │
│ • Manifest V3 Service Worker + Content Script               │
│ • Type-safe Message Bus                                     │
│ • Hotkey Alt + A & Mini Companion Window Manager (460px)    │
│ 🎯 Milestone: Bấm Alt + A mở được Mini Companion bên phải   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: Context Engine & Shadow DOM Spotlight HUD          │
│ • DOM Selection & Source Metadata Extractor                 │
│ • OmniContext Normalizer & Token/Char Budget Calculator     │
│ • Shadow DOM Container & Isolated React Mounting            │
│ • Spotlight HUD: Preview, Quick Actions & Prompt Input      │
│ 🎯 Milestone: Alt + A mở HUD tại chỗ, preview context chuẩn  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: Provider Adapter & Mini Companion Automation       │
│ • Provider Registry & ChatGPT Adapter                       │
│ • Prompt Formatter Markdown Template                        │
│ • Automation DOM Injector (Synthetic Events + Timeout)      │
│ • First-Class Clipboard Fallback Handler + Toast            │
│ 🎯 Milestone: Gửi context thành công vào ChatGPT Mini Window│
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: Hardening, Edge Cases & Production Packaging       │
│ • Privacy Guard (Blacklist, Password field protection)      │
│ • Graceful Error Handling on Restricted URLs                │
│ • User Preferences Storage (Default actions, budget)        │
│ • Final Verification vs 10/10 DoD & Production Build        │
│ 🎯 Milestone: Bản phát hành v0.1 hoàn chỉnh, 0 bug          │
└─────────────────────────────────────────────────────────────┘
```

---

## DANH SÁCH CHI TIẾT TỪNG PHASE

1. [Phase 1: Extension Skeleton & Mini Companion Launcher](./phase-1-scaffold-and-runtime.md)
2. [Phase 2: Context Engine & Shadow DOM Spotlight HUD](./phase-2-context-and-hud.md)
3. [Phase 3: Provider Adapter & Mini Companion Automation](./phase-3-mini-companion-automation.md)
4. [Phase 4: Hardening, Edge Cases & Production Packaging](./phase-4-hardening-and-release.md)
