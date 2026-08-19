from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent
LOGO = ROOT / 'logo.png'
LOGO_SOURCE = ROOT / 'logo_source.jpg.b64'


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    if old not in text:
        print(f'[skip] {label}: pattern not found')
        return text
    print(f'[patch] {label}')
    return text.replace(old, new, 1)


def patch_index():
    p = ROOT / 'index.html'
    s = p.read_text(encoding='utf-8')
    s = replace_once(
        s,
        '<title>Sliqadius — KI-Assistent</title>',
        '<title>Sliqadius — KI-Assistent</title>\n<link rel="icon" type="image/png" href="logo.png">\n<link rel="apple-touch-icon" href="logo.png">',
        'website favicon',
    )
    old_css = '.brandmark{width:30px;height:30px;border-radius:10px;display:grid;place-items:center;background:linear-gradient(145deg,var(--green),var(--green2));box-shadow:0 0 34px rgba(57,217,138,.22);color:#07110b;font-size:15px;font-weight:950}'
    new_css = '.brandlogo{width:34px;height:34px;border-radius:10px;object-fit:cover;display:block;box-shadow:0 0 30px rgba(57,217,138,.18)}'
    s = replace_once(s, old_css, new_css, 'website header logo css')
    s = s.replace('.brandmark{width:28px;height:28px}', '.brandlogo{width:30px;height:30px}')
    s = replace_once(
        s,
        '<a class="brand" href="#top"><span class="brandmark">S</span><span>Sliqadius</span></a>',
        '<a class="brand" href="#top"><img class="brandlogo" src="logo.png" alt="Sliqadius Logo"><span>Sliqadius</span></a>',
        'website header logo html',
    )
    p.write_text(s, encoding='utf-8')


def patch_web():
    p = ROOT / 'web.html'
    s = p.read_text(encoding='utf-8')
    s = replace_once(
        s,
        '<title>Sliqadius Web</title>',
        '<title>Sliqadius Web</title>\n<link rel="icon" type="image/png" href="logo.png">\n<link rel="apple-touch-icon" href="logo.png">',
        'web app favicon',
    )
    s = s.replace(
        '.brand{font-size:20px;font-weight:850;padding:8px 9px 12px}',
        '.brand{font-size:20px;font-weight:850;padding:8px 9px 12px;display:flex;align-items:center;gap:10px}.brandlogo{width:34px;height:34px;border-radius:10px;object-fit:cover;display:block;box-shadow:0 0 26px rgba(57,217,138,.16)}',
        1,
    )
    s = s.replace(
        '.title{font-size:17px;font-weight:750}',
        '.title{font-size:17px;font-weight:750;display:flex;align-items:center;gap:8px}.toplogo{width:28px;height:28px;border-radius:8px;object-fit:cover;display:block}',
        1,
    )
    s = replace_once(
        s,
        '<aside class="side" id="side"><div class="brand">Sliqadius Web</div>',
        '<aside class="side" id="side"><div class="brand"><img class="brandlogo" src="logo.png" alt="Sliqadius Logo"><span>Sliqadius Web</span></div>',
        'web sidebar logo',
    )
    s = replace_once(
        s,
        '<span class="title">Sliqadius</span>',
        '<span class="title"><img class="toplogo" src="logo.png" alt="">Sliqadius</span>',
        'web topbar logo',
    )
    p.write_text(s, encoding='utf-8')


def patch_python():
    p = ROOT / 'Sliqadius.py'
    s = p.read_text(encoding='utf-8')
    s = replace_once(
        s,
        'from PySide6.QtGui import QFont, QPixmap, QDesktopServices',
        'from PySide6.QtGui import QFont, QPixmap, QDesktopServices, QIcon',
        'desktop QIcon import',
    )
    anchor = 'os.makedirs(DATA_DIR, exist_ok=True)\n\n'
    helper = '''os.makedirs(DATA_DIR, exist_ok=True)\n\ndef resource_path(name):\n    base = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))\n    return os.path.join(base, name)\n\n'''
    if 'def resource_path(name):' not in s and anchor in s:
        s = s.replace(anchor, helper, 1)
        print('[patch] desktop resource helper')

    s = replace_once(
        s,
        '        self.setWindowTitle(APP_NAME)\n        self.resize(1180, 780)',
        '        self.setWindowTitle(APP_NAME)\n        icon_path = resource_path("logo.png")\n        if os.path.isfile(icon_path):\n            self.setWindowIcon(QIcon(icon_path))\n        self.resize(1180, 780)',
        'desktop window icon',
    )

    old_brand = '''        brand = QLabel("Sliqadius")\n        brand.setObjectName("brand")\n        brand.setContentsMargins(7, 1, 0, 5)\n        side.addWidget(brand)'''
    new_brand = '''        brand_box = QWidget()\n        brand_row = QHBoxLayout(brand_box)\n        brand_row.setContentsMargins(7, 1, 0, 5)\n        brand_row.setSpacing(9)\n\n        brand_icon = QLabel()\n        brand_pixmap = QPixmap(resource_path("logo.png"))\n        if not brand_pixmap.isNull():\n            brand_icon.setPixmap(brand_pixmap.scaled(30, 30, Qt.KeepAspectRatio, Qt.SmoothTransformation))\n        brand_icon.setFixedSize(30, 30)\n\n        brand = QLabel("Sliqadius")\n        brand.setObjectName("brand")\n        brand_row.addWidget(brand_icon)\n        brand_row.addWidget(brand)\n        brand_row.addStretch()\n        side.addWidget(brand_box)'''
    s = replace_once(s, old_brand, new_brand, 'desktop sidebar logo')

    old_welcome = '''        title = QLabel(tr("welcome"))\n        title.setObjectName("welcome")\n        title.setAlignment(Qt.AlignCenter)'''
    new_welcome = '''        welcome_icon = QLabel()\n        welcome_pixmap = QPixmap(resource_path("logo.png"))\n        if not welcome_pixmap.isNull():\n            welcome_icon.setPixmap(welcome_pixmap.scaled(72, 72, Qt.KeepAspectRatio, Qt.SmoothTransformation))\n        welcome_icon.setFixedSize(72, 72)\n        welcome_icon.setAlignment(Qt.AlignCenter)\n\n        title = QLabel(tr("welcome"))\n        title.setObjectName("welcome")\n        title.setAlignment(Qt.AlignCenter)'''
    s = replace_once(s, old_welcome, new_welcome, 'desktop welcome logo declaration')
    s = replace_once(
        s,
        '        layout.addWidget(title)\n        layout.addWidget(hint)',
        '        layout.addWidget(welcome_icon, 0, Qt.AlignCenter)\n        layout.addSpacing(8)\n        layout.addWidget(title)\n        layout.addWidget(hint)',
        'desktop welcome logo insertion',
    )
    p.write_text(s, encoding='utf-8')


def patch_windows_workflow():
    p = ROOT / '.github/workflows/windows-build.yml'
    s = p.read_text(encoding='utf-8')
    if '      - logo.png\n' not in s:
        s = s.replace('      - index.html\n', '      - index.html\n      - logo.png\n      - Sliqadius.ico\n', 1)
    s = s.replace(
        'pyinstaller --noconfirm --clean --windowed --onefile --name Sliqadius Sliqadius.py',
        'pyinstaller --noconfirm --clean --windowed --onefile --name Sliqadius --icon Sliqadius.ico --add-data "logo.png;." Sliqadius.py',
    )
    p.write_text(s, encoding='utf-8')


def patch_macos_workflow():
    p = ROOT / '.github/workflows/macos-build.yml'
    s = p.read_text(encoding='utf-8')
    if '      - logo.png\n' not in s:
        s = s.replace('      - index.html\n', '      - index.html\n      - logo.png\n      - Sliqadius.icns\n', 1)
    s = s.replace(
        'pyinstaller --noconfirm --clean --windowed --name Sliqadius Sliqadius.py',
        'pyinstaller --noconfirm --clean --windowed --name Sliqadius --icon Sliqadius.icns --add-data "logo.png:." Sliqadius.py',
    )
    p.write_text(s, encoding='utf-8')


def patch_readme():
    p = ROOT / 'README.md'
    if not p.exists():
        return
    s = p.read_text(encoding='utf-8')
    badge = '<p align="center"><img src="logo.png" alt="Sliqadius" width="128"></p>\n\n'
    if '<img src="logo.png"' not in s:
        p.write_text(badge + s, encoding='utf-8')
        print('[patch] README logo')


def decode_logo_source():
    import base64
    if LOGO_SOURCE.exists():
        raw = base64.b64decode(LOGO_SOURCE.read_text(encoding='ascii').strip())
        tmp = ROOT / '_approved_logo_source.jpg'
        tmp.write_bytes(raw)
        Image.open(tmp).convert('RGBA').save(LOGO, format='PNG', optimize=True)
        tmp.unlink(missing_ok=True)
        print('[generate] logo.png from approved source')
    if not LOGO.exists():
        raise SystemExit('logo.png fehlt')

def generate_native_icons():
    if not LOGO.exists():
        raise SystemExit('logo.png fehlt')
    im = Image.open(LOGO).convert('RGBA')
    im.save(ROOT / 'Sliqadius.ico', format='ICO', sizes=[(16,16),(24,24),(32,32),(48,48),(64,64),(128,128),(256,256)])
    im.resize((512, 512), Image.Resampling.LANCZOS).save(ROOT / 'Sliqadius.icns', format='ICNS')
    print('[generate] Sliqadius.ico + Sliqadius.icns')


def prepare_android_assets():
    im = Image.open(LOGO).convert('RGBA')
    sizes = {'mdpi':48,'hdpi':72,'xhdpi':96,'xxhdpi':144,'xxxhdpi':192}
    for density, size in sizes.items():
        d = ROOT / 'android' / 'app' / 'src' / 'main' / 'res' / f'mipmap-{density}'
        d.mkdir(parents=True, exist_ok=True)
        im.resize((size, size), Image.Resampling.LANCZOS).save(d / 'ic_launcher.png')
        im.resize((size, size), Image.Resampling.LANCZOS).save(d / 'ic_launcher_round.png')
    d = ROOT / 'android' / 'app' / 'src' / 'main' / 'res' / 'drawable-nodpi'
    d.mkdir(parents=True, exist_ok=True)
    im.resize((512,512), Image.Resampling.LANCZOS).save(d / 'sliqadius_logo.png')
    print('[generate] Android launcher/logo assets')


def main():
    decode_logo_source()
    generate_native_icons()
    prepare_android_assets()
    patch_index()
    patch_web()
    patch_python()
    patch_windows_workflow()
    patch_macos_workflow()
    patch_readme()
    print('SLIQADIUS_LOGO_BRANDING_OK')


if __name__ == '__main__':
    main()
