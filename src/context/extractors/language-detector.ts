export function detectLanguage(text: string, isCode: boolean): string | undefined {
  if (!isCode && text.length < 20) return undefined;

  const url = typeof window !== 'undefined' && window.location ? window.location.href.toLowerCase() : '';
  
  // Detect by file extension in URL
  if (url) {
    const extMatch = url.match(/\.([a-z0-9]+)(?:#|\?|$)/i);
    if (extMatch) {
      const ext = extMatch[1];
      const extMap: Record<string, string> = {
        ts: 'typescript',
        tsx: 'typescript',
        js: 'javascript',
        jsx: 'javascript',
        py: 'python',
        rs: 'rust',
        go: 'go',
        java: 'java',
        cpp: 'cpp',
        c: 'c',
        cs: 'csharp',
        rb: 'ruby',
        php: 'php',
        html: 'html',
        css: 'css',
        sql: 'sql',
        json: 'json',
        yaml: 'yaml',
        yml: 'yaml',
        sh: 'bash',
      };
      if (extMap[ext]) return extMap[ext];
    }
  }

  // Detect by common keywords and syntax
  if (/^(import |export |const |let |function |class |interface |type )/m.test(text)) {
    if (/:\s*(string|number|boolean|any|void|\w+\[\])/m.test(text)) return 'typescript';
    return 'javascript';
  }
  if (/^(def |class |import |from .* import |elif |print\()/m.test(text)) return 'python';
  if (/^(fn |pub |use |struct |impl |match |let mut )/m.test(text)) return 'rust';
  if (/^(package |func |import \(|var |type .* struct)/m.test(text)) return 'go';
  if (/^(public class |public static void main|System\.out\.println)/m.test(text)) return 'java';
  if (/#include\s*<|std::/m.test(text)) return 'cpp';
  if (/<\?php|\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/m.test(text)) return 'php';
  if (/SELECT .* FROM |INSERT INTO |CREATE TABLE /i.test(text)) return 'sql';

  return isCode ? 'code' : undefined;
}
