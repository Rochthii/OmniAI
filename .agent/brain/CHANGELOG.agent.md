# OMNIAI - AGENT SNAPSHOT & CHANGELOG
<!-- FAST CONTEXT SYNC FOR AI AGENTS • TOKEN BUDGET < 300 TOKENS -->

## ⚡ META
- **App**: OmniAI (Browser Extension - Manifest V3)
- **Stack**: React 18 + TypeScript + Vite + CRXJS + Shadow DOM + Split-Screen Dock
- **Concept**: Split-Screen Side-by-Side Dock with 100% True Zero Network Reload.

## 🌟 CORE UX HIGHLIGHTS (v0.6.2)
1. **Chế Độ Dock Chia Đôi Màn Hình (Split-Screen Push)**:
   - Khi mở Side Panel: Tự động co lùi trang web chính sang trái (`margin-right: 480px`), gắn cố định song song y hệt Edge Native Sidebar (không che khuất bài viết).
   - Khi đóng (`✕` hoặc `Alt + Z` hoặc click `[⚡ AI]`): Trang web tự động bung rộng trở lại.
   - **ĐẶC BIỆT: KHÔNG UNMOUNT IFRAME ➔ KHÔNG PHÁT SINH NETWORK RELOAD, KHÔNG CÓ VÒNG QUAY LOAD LẠI DÙ CHỈ 1 BYTE!**

## 🚦 CURRENT STATE
- **Phase**: **V0.6.2 - SPLIT-SCREEN ZERO RELOAD COMPLETE**
- **Dist Path**: `E:\Projects\Project_ca_nhan\omniai\dist`

## 📜 CHANGELOG / MILESTONES
- `[2026-08-17]` **v0.6.2**: Tích hợp cơ chế Split-Screen Screen Pushing • Tự động đẩy trang chia đôi màn hình không che chữ • 100% Zero Network Reload khi đóng/mở • Đã build hoàn tất.
