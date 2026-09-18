"""Шакиров Б. К. версиясынын өзүнчө сайтын (shakirov-site/) жаңыртат.

Шакировдун версиясы `shakirov.html` файлында — аны кол менен түзөтсөңүз болот.
Ушул скрипт аны жана жалпы css/js/assets папкаларын shakirov-site/ ичине көчүрөт:

    python tools/build_shakirov.py
"""
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / 'shakirov.html'
SITE = ROOT / 'shakirov-site'
COPY = ('css', 'js', 'assets')
OLD_NOTE = '<!-- Бул файл кол менен түзөтүлбөйт: python tools/build_shakirov.py -->\n'

README = '''# Алтын-Аска · Чакыруу (Шакиров Б. К.)

«Кызыл-Кыя» комплексинин биринчи ташын коюу аземине чакыруунун Шакиров Б. К.
версиясы. Бул папка кол менен түзөтүлбөйт: тексттерди негизги репозиторийдеги
`shakirov.html` файлынан өзгөртүп, `python tools/build_shakirov.py` иштетиңиз.

Vercel'де өзүнчө долбоор катары жайгаштырылат: Root Directory = `shakirov-site`.
'''


def main() -> None:
    html = PAGE.read_text(encoding='utf-8')
    if OLD_NOTE in html:
        html = html.replace(OLD_NOTE, '')
        PAGE.write_text(html, encoding='utf-8')

    SITE.mkdir(exist_ok=True)
    for name in COPY:
        target = SITE / name
        if target.exists():
            shutil.rmtree(target)
        shutil.copytree(ROOT / name, target)
    (SITE / 'index.html').write_text(html, encoding='utf-8')
    (SITE / 'README.md').write_text(README, encoding='utf-8')
    print(f'{SITE.name}/ жаңыртылды')


if __name__ == '__main__':
    main()
