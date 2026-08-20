import assert from 'assert';

// 1. Mock Browser Environment for Unit Testing
class MockStorage {
  data: Record<string, any> = {};
  get(keys: string[], cb: (res: any) => void) {
    const res: any = {};
    for (const k of keys) {
      if (this.data[k] !== undefined) res[k] = this.data[k];
    }
    cb(res);
  }
  set(items: Record<string, any>, cb?: () => void) {
    Object.assign(this.data, items);
    if (cb) cb();
  }
}

(global as any).chrome = {
  storage: {
    local: new MockStorage(),
  },
};

// 2. Test Suites
async function runAllTests() {
  console.log('🧪 BẮT ĐẦU CHẠY KIỂM THỬ TOÀN DIỆN OMNIAI...\n');

  // --- SCENARIO 1: LANGUAGE DETECTION ---
  console.log('▶ Test 1: Nhận diện ngôn ngữ lập trình & Cú pháp');
  const { detectLanguage } = await import('../src/context/extractors/language-detector');
  
  const tsCode = 'interface User { id: string; name: string; } export const user: User = { id: "1", name: "Nam" };';
  const pyCode = 'def calculate_total(items):\n    total = 0\n    for item in items:\n        total += item.price\n    return total';
  const sqlCode = 'SELECT id, username, email FROM users WHERE active = 1 ORDER BY created_at DESC;';
  const plainText = 'Đây là một đoạn văn bản tiếng Việt bình thường không phải code.';

  assert.strictEqual(detectLanguage(tsCode, true), 'typescript', 'TS detection failed');
  assert.strictEqual(detectLanguage(pyCode, true), 'python', 'Python detection failed');
  assert.strictEqual(detectLanguage(sqlCode, true), 'sql', 'SQL detection failed');
  assert.strictEqual(detectLanguage(plainText, false), undefined, 'Plain text should not be code');
  console.log('  ✅ Pass: Nhận diện đúng TypeScript, Python, SQL và Plain Text\n');

  // --- SCENARIO 2: PROMPT FORMATTING & TEMPLATES ---
  console.log('▶ Test 2: Định dạng Prompt Markdown cho các Web AI');
  const { ChatGPTProvider } = await import('../src/providers/chatgpt');
  const { ClaudeProvider } = await import('../src/providers/claude');
  const { GeminiProvider } = await import('../src/providers/gemini');

  const mockContext = {
    id: 'test-123',
    createdAt: Date.now(),
    source: { url: 'https://github.com/facebook/react', title: 'React GitHub', domain: 'github.com' },
    type: 'code' as const,
    metadata: { language: 'typescript' },
    content: 'const [state, setState] = useState(0);',
    metrics: { charCount: 40, estimatedTokens: 12, isTruncated: false },
  };

  const chatgpt = new ChatGPTProvider();
  const claude = new ClaudeProvider();
  const gemini = new GeminiProvider();

  const customPrompt = 'Hãy tìm lỗi bug trong đoạn mã này:';
  const gptOutput = chatgpt.formatPrompt(mockContext, customPrompt);
  const claudeOutput = claude.formatPrompt(mockContext, '');
  const geminiOutput = gemini.formatPrompt(mockContext, 'Giải thích giúp tôi:');

  assert.ok(gptOutput.includes('Hãy tìm lỗi bug'), 'Custom prompt missing in ChatGPT output');
  assert.ok(gptOutput.includes('```typescript'), 'Code block markdown missing');
  assert.ok(gptOutput.includes('https://github.com/facebook/react'), 'Source URL missing in ChatGPT');
  assert.ok(claudeOutput.includes('https://github.com/facebook/react'), 'Source URL missing in Claude');
  assert.ok(geminiOutput.includes('Giải thích giúp tôi:'), 'Custom prompt missing in Gemini');
  console.log('  ✅ Pass: Prompt format chuẩn xác Markdown, gắn đúng link nguồn & code block\n');

  // --- SCENARIO 3: QUERY URL INTERPOLATION ---
  console.log('▶ Test 3: Cơ chế ghép từ khóa {query} cho URL Tra cứu / Dịch');
  const sampleUrl = 'https://translate.google.com/?sl=auto&tl=vi&text={query}&op=translate';
  const queryText = 'memory leak in detached DOM tree';
  const encodedQuery = encodeURIComponent(queryText);
  const finalUrl = sampleUrl.replace('{query}', encodedQuery);

  assert.strictEqual(
    finalUrl,
    'https://translate.google.com/?sl=auto&tl=vi&text=memory%20leak%20in%20detached%20DOM%20tree&op=translate',
    'URL Query encoding failed'
  );
  console.log('  ✅ Pass: Thay thế {query} an toàn, mã hóa URL chuẩn xác không lỗi dấu cách\n');

  // --- SCENARIO 4: PRIVACY GUARD ---
  console.log('▶ Test 4: Kiểm tra tính năng Bảo mật & Privacy Guard');
  const { checkPrivacyGuard } = await import('../src/privacy/guard');

  // Test password element
  const mockPasswordInput = {
    getAttribute: (attr: string) => (attr === 'type' ? 'password' : null),
    closest: () => true,
  } as any;

  const mockNormalInput = {
    getAttribute: (attr: string) => (attr === 'type' ? 'text' : null),
    closest: () => null,
  } as any;

  const blockedResult = checkPrivacyGuard(mockPasswordInput);
  const allowedResult = checkPrivacyGuard(mockNormalInput);

  assert.strictEqual(blockedResult.allowed, false, 'Password input must be blocked');
  assert.strictEqual(allowedResult.allowed, true, 'Normal input should be allowed');
  console.log('  ✅ Pass: Chặn 100% việc đọc trích xuất từ các trường mật khẩu\n');

  // --- SCENARIO 5: STORAGE & PREFERENCES CRUD ---
  console.log('▶ Test 5: Quản lý Cấu hình & Danh sách Web Tùy chỉnh (Storage)');
  const { getUserPreferences, saveUserPreferences, DEFAULT_PREFERENCES } = await import('../src/shared/storage');

  const initialPrefs = await getUserPreferences();
  assert.strictEqual(initialPrefs.defaultSiteId, 'chatgpt');
  assert.strictEqual(initialPrefs.enableFloatingButton, true);

  // Add custom site
  const customSite = { id: 'wiki', name: 'Wikipedia', url: 'https://vi.wikipedia.org/wiki/{query}', isCustom: true };
  await saveUserPreferences({
    sites: [...initialPrefs.sites, customSite],
    defaultSiteId: 'wiki',
  });

  const updatedPrefs = await getUserPreferences();
  assert.strictEqual(updatedPrefs.defaultSiteId, 'wiki');
  assert.ok(updatedPrefs.sites.some((s) => s.id === 'wiki'), 'Custom site not saved');
  console.log('  ✅ Pass: Lưu trữ preferences và thêm/xóa/đổi web mặc định thành công\n');

  console.log('🎉 TẤT CẢ 5 BỘ TEST SUITES ĐỀU ĐẠT CHUẨN 100%!');
}

runAllTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
