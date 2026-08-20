# OmniAI ⚡

> **Cầu nối ngữ cảnh siêu tốc giữa Trình duyệt và Web AI (ChatGPT, Claude, Gemini)**  
> 100% Local-first • Không cần API Key • Tự động Clipboard Fallback • Bảo mật tuyệt đối

---

## 📂 Cấu trúc Dự án (AI-Ready & Clean Architecture)

```text
omniai/
├── .agent/              # 🧠 Bộ não, quy tắc và kỹ năng tương tác cùng AI
│   ├── rules/           # Quy tắc bất biến (No mock, MV3 security, code standards)
│   ├── brain/           # Bộ nhớ ngữ cảnh & Bảng theo dõi tiến độ (Task board)
│   └── skills/          # Kịch bản tự động hóa (Thêm provider, test DOM, release)
│
├── docs/                # 📑 Đặc tả & Quyết định kỹ thuật
│   ├── specs/           # Master Spec v1.0 (Frozen)
│   └── adr/             # Architecture Decision Records
│
├── src/                 # 💻 Mã nguồn chính
│   ├── background/      # Service Worker (MV3)
│   ├── content/         # Content Scripts & DOM Extractor
│   ├── context/         # Context Engine & Normalizers
│   ├── providers/       # AI Providers (ChatGPT, Claude, Gemini)
│   ├── automation/      # DOM Injector & Clipboard Fallback
│   ├── ui/              # Shadow DOM React UI (HUD, Modal)
│   └── shared/          # Types, Messages, Storage Utils
│
└── package.json
```

---

## 🚀 Bắt đầu phát triển

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy môi trường dev
npm run dev

# 3. Nạp Extension vào Chrome
# Mở chrome://extensions -> Bật "Developer mode" -> Chọn "Load unpacked" -> Chọn thư mục dist/
```
