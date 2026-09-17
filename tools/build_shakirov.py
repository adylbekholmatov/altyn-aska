"""Шакиров Б. К. кол койгон версияны түзөт.

Эки нерсе жаралат:
  * shakirov.html          — негизги сайттагы кошумча барак
  * shakirov-site/         — өзүнчө Vercel долбоору үчүн толук көчүрмө

index.html же css/js/assets өзгөргөндөн кийин ушуну иштетиңиз:

    python tools/build_shakirov.py
"""
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'index.html'
PAGE = ROOT / 'shakirov.html'
SITE = ROOT / 'shakirov-site'
COPY = ('css', 'js', 'assets')

SIGN_FROM = ('<strong>Сатаров Кубанычбек Машрапович</strong>\n'
             '        <em>«Агро-Майдан» ЖЧКнын директору</em>')
SIGN_TO = ('<strong>Шакиров Байстан Куттугалиевич</strong>\n'
           '        <em>«Алтын-Аска» ЖЧКнын башкы директору</em>')

NOTE = ('<!doctype html>\n'
        '<!-- Бул файл кол менен түзөтүлбөйт: python tools/build_shakirov.py -->\n')

README = '''# Алтын-Аска · Чакыруу (Шакиров Б. К.)

«Кызыл-Кыя» комплексинин биринчи ташын коюу аземине чакыруу —
каты **Шакиров Байстан Куттугалиевичтин** атынан.

Бул папка `index.html` жана `tools/build_shakirov.py` аркылуу автоматтык
түрдө түзүлөт, кол менен түзөтүлбөйт. Vercel'де өзүнчө долбоор катары
жайгаштырылат: Root Directory = `shakirov-site`.
'''


def main() -> None:
    html = SOURCE.read_text(encoding='utf-8')
    if SIGN_FROM not in html:
        raise SystemExit('index.html ичинен кол коюу табылган жок — скрипт жаңыртылсын')
    signed = html.replace(SIGN_FROM, SIGN_TO)

    PAGE.write_text(signed.replace('<!doctype html>\n', NOTE, 1), encoding='utf-8')

    SITE.mkdir(exist_ok=True)
    for name in COPY:
        target = SITE / name
        if target.exists():
            shutil.rmtree(target)
        shutil.copytree(ROOT / name, target)
    (SITE / 'index.html').write_text(signed, encoding='utf-8')
    (SITE / 'README.md').write_text(README, encoding='utf-8')
    print(f'{PAGE.name} жана {SITE.name}/ даяр')


if __name__ == '__main__':
    main()
