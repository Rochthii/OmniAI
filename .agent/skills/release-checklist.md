# SKILL: CHECKLIST TRƯỚC KHI BUILD PRODUCTION

Trước khi đóng gói file extension `.zip` hoặc build production:

## Checklist:
1. **Kiểm tra TypeScript**: Chạy `npm run type-check` hoặc `tsc --noEmit` không có bất kỳ lỗi nào.
2. **Kiểm tra Linter & Build**: Chạy `npm run build` xuất thư mục `dist/` thành công.
3. **Quyền hạn Manifest**: Kiểm tra `manifest.json` trong `dist/` không chứa permissions thừa.
4. **Không có Mock Data**: Đảm bảo không còn dữ liệu fake/placeholder trong code.
5. **Kiểm thử trên trình duyệt sạch**: Load Unpacked extension trên Chrome profile mới để kiểm tra luồng cài đặt và cấp quyền ban đầu.
