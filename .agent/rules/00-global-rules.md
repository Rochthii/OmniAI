# GLOBAL RULES - OMNIAI

## 1. Nguyên tắc Vibe Coding & Làm việc
1. Khi bắt đầu phiên làm việc mới, đọc `.agent/brain/context.md` và `.agent/brain/task-board.md` trước khi trả lời.
2. Trước mọi hành động nâng cấp, cải thiện hay sửa lỗi, phải phân tích nguyên nhân và lập kế hoạch thực hiện rõ ràng.
3. Chỉ biên dịch hoặc chạy chương trình khi đã có giả thuyết kỹ thuật cụ thể để kiểm chứng, không thử ngẫu nhiên.
4. Tuân thủ yêu cầu người dùng, trừ khi mâu thuẫn logic hoặc gây lỗi nghiêm trọng.
5. Báo cáo bằng tiếng Việt, rõ ràng, có cấu trúc.

---

## 2. Tiêu chuẩn Production-Real (Bắt buộc)
1. **No Mock / No Fake / No Placeholder**: Không demo buttons, không hard-coded mock response, không giả lập thành công khi backend/logic chưa chạy.
2. **Real Side Effects**: Mỗi nút bấm, phím tắt (`Alt + A`) phải gọi logic thật, tạo `OmniContext` thật, kích hoạt automation/clipboard thật.
3. **Data Integrity & Privacy**: 
   - 100% Local-First.
   - Không có telemetry, không gửi dữ liệu ra bên ngoài máy của người dùng.
   - Mọi thao tác cắt ngắn dữ liệu (truncation) phải minh bạch cho người dùng biết số lượng ký tự/tokens.
4. **Graceful Fallback**: Nếu Automation DOM thất bại (do UI AI đổi), hệ thống PHẢI fallback tự động sang Clipboard mà không làm mất dữ liệu của người dùng.
