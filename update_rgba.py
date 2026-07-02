from pathlib import Path
import re
files = [Path('scss/_components.scss'), Path('css/main.css')]
pattern = re.compile(r'rgba\(var\(--color-paper-rgb\),\s*[^)]+\)')
replacement = 'rgba(var(--color-paper-rgb), 0.6)'
for path in files:
    text = path.read_text(encoding='utf-8')
    new_text = pattern.sub(replacement, text)
    if new_text != text:
        path.write_text(new_text, encoding='utf-8')
        print(f'updated {path}')
    else:
        print(f'no changes {path}')
