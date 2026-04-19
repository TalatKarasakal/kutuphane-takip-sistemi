const CP1254: Record<number, string> = {
  0x80: '€', 0x82: '‚', 0x83: 'ƒ', 0x84: '„', 0x85: '…', 0x86: '†', 0x87: '‡',
  0x88: 'ˆ', 0x89: '‰', 0x8a: 'Š', 0x8b: '‹', 0x8c: 'Œ',
  0x91: '\u2018', 0x92: '\u2019', 0x93: '\u201c', 0x94: '\u201d', 0x95: '•',
  0x96: '–', 0x97: '—', 0x98: '˜', 0x99: '™', 0x9a: 'š', 0x9b: '›', 0x9c: 'œ', 0x9f: 'Ÿ',
  0xd0: 'Ğ', 0xdd: 'İ', 0xde: 'Ş', 0xf0: 'ğ', 0xfd: 'ı', 0xfe: 'ş',
};

export function isRtf(text: string): boolean {
  return text.trimStart().startsWith('{\\rtf');
}

export function rtfToPlainText(rtf: string): string {
  let s = rtf;

  s = s.replace(/\{\\fonttbl[\s\S]*?\}\s*\}/g, '');
  s = s.replace(/\{\\colortbl[\s\S]*?\}/g, '');
  s = s.replace(/\{\\stylesheet[\s\S]*?\}\s*\}/g, '');
  s = s.replace(/\{\\\*\\expandedcolortbl[\s\S]*?\}/g, '');
  s = s.replace(/\{\\\*[\s\S]*?\}/g, '');

  s = s.replace(/\\u(-?\d+)\??/g, (_, n) => {
    let code = Number(n);
    if (code < 0) code += 65536;
    return String.fromCharCode(code);
  });

  s = s.replace(/\\'([0-9a-fA-F]{2})/g, (_, h) => {
    const code = parseInt(h, 16);
    return CP1254[code] ?? String.fromCharCode(code);
  });

  s = s.replace(/\\par[d]?\b ?/g, '\n');
  s = s.replace(/\\line\b ?/g, '\n');
  s = s.replace(/\\tab\b ?/g, '\t');

  s = s.replace(/\\[a-zA-Z]+-?\d* ?/g, '');

  s = s.replace(/[{}]/g, '');

  s = s.replace(/\\([\\{}])/g, '$1');

  s = s.split('\n').map((l) => l.trim()).filter(Boolean).join('\n');

  return s;
}
