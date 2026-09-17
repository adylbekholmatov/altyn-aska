"""index.html'ден экинчи барак (shakirov.html) түзүлөт.

Айырмасы бир гана: каттын астындагы кол коюу.
index.html өзгөргөндөн кийин ушул скриптти кайра иштетиңиз:

    python tools/build_shakirov.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'index.html'
TARGET = ROOT / 'shakirov.html'

SIGN_FROM = ('<strong>Сатаров Кубанычбек Машрапович</strong>\n'
             '        <em>«Агро-Майдан» ЖЧКнын директору</em>')
SIGN_TO = ('<strong>Шакиров Байстан Куттугалиевич</strong>\n'
           '        <em>«Алтын-Аска» ЖЧКнын башкы директору</em>')

NOTE = ('<!doctype html>\n'
        '<!-- Бул файл кол менен түзөтүлбөйт: python tools/build_shakirov.py -->\n')


def main() -> None:
    html = SOURCE.read_text(encoding='utf-8')
    if SIGN_FROM not in html:
        raise SystemExit('index.html ичинен кол коюу табылган жок — build_shakirov.py жаңыртылсын')
    html = html.replace(SIGN_FROM, SIGN_TO).replace('<!doctype html>\n', NOTE, 1)
    TARGET.write_text(html, encoding='utf-8')
    print(f'{TARGET.name} даяр')


if __name__ == '__main__':
    main()
