from pathlib import Path
import py_compile

P = Path('Sliqadius.py')
S = P.read_text(encoding='utf-8')
MARK = '# SLIQADIUS_APPROVED_LOGO_V1'

if MARK not in S:
    S = S.replace(
        'from PySide6.QtGui import QFont, QPixmap, QDesktopServices',
        'from PySide6.QtGui import QFont, QPixmap, QDesktopServices, QIcon',
        1,
    )

    anchor = 'os.makedirs(DATA_DIR, exist_ok=True)\n\n'
    helper = '''os.makedirs(DATA_DIR, exist_ok=True)\n\n\ndef resource_path(name):\n    base = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))\n    return os.path.join(base, name)\n\n'''
    if 'def resource_path(name):' not in S:
        if anchor not in S:
            raise RuntimeError('DATA_DIR anchor not found')
        S = S.replace(anchor, helper, 1)

    old_window = '''        self.setWindowTitle(APP_NAME)\n        self.resize(1180, 780)'''
    new_window = '''        self.setWindowTitle(APP_NAME)\n        logo_path = resource_path("logo-approved.jpg")\n        if os.path.isfile(logo_path):\n            self.setWindowIcon(QIcon(logo_path))\n        self.resize(1180, 780)'''
    if old_window not in S:
        raise RuntimeError('Window title anchor not found')
    S = S.replace(old_window, new_window, 1)

    old_brand = '''        brand = QLabel("Sliqadius")\n        brand.setObjectName("brand")\n        brand.setContentsMargins(7, 1, 0, 5)\n        side.addWidget(brand)'''
    new_brand = '''        brand_box = QWidget()\n        brand_row = QHBoxLayout(brand_box)\n        brand_row.setContentsMargins(7, 1, 0, 5)\n        brand_row.setSpacing(9)\n\n        brand_icon = QLabel()\n        brand_pixmap = QPixmap(resource_path("logo-approved.jpg"))\n        if not brand_pixmap.isNull():\n            brand_icon.setPixmap(brand_pixmap.scaled(30, 30, Qt.KeepAspectRatio, Qt.SmoothTransformation))\n        brand_icon.setFixedSize(30, 30)\n\n        brand = QLabel("Sliqadius")\n        brand.setObjectName("brand")\n        brand_row.addWidget(brand_icon)\n        brand_row.addWidget(brand)\n        brand_row.addStretch()\n        side.addWidget(brand_box)'''
    if old_brand not in S:
        raise RuntimeError('Sidebar brand anchor not found')
    S = S.replace(old_brand, new_brand, 1)

    old_welcome = '''        title = QLabel(tr("welcome"))\n        title.setObjectName("welcome")\n        title.setAlignment(Qt.AlignCenter)'''
    new_welcome = '''        welcome_logo = QLabel()\n        welcome_pixmap = QPixmap(resource_path("logo-approved.jpg"))\n        if not welcome_pixmap.isNull():\n            welcome_logo.setPixmap(welcome_pixmap.scaled(74, 74, Qt.KeepAspectRatio, Qt.SmoothTransformation))\n        welcome_logo.setFixedSize(74, 74)\n        welcome_logo.setAlignment(Qt.AlignCenter)\n\n        title = QLabel(tr("welcome"))\n        title.setObjectName("welcome")\n        title.setAlignment(Qt.AlignCenter)'''
    if old_welcome not in S:
        raise RuntimeError('Welcome title anchor not found')
    S = S.replace(old_welcome, new_welcome, 1)

    old_widgets = '''        layout.addWidget(title)\n        layout.addWidget(hint)'''
    new_widgets = '''        layout.addWidget(welcome_logo, 0, Qt.AlignCenter)\n        layout.addSpacing(7)\n        layout.addWidget(title)\n        layout.addWidget(hint)'''
    if old_widgets not in S:
        raise RuntimeError('Welcome layout anchor not found')
    S = S.replace(old_widgets, new_widgets, 1)

    S = S.replace('# SLIQADIUS_SMARTER_V2', '# SLIQADIUS_SMARTER_V2\n' + MARK, 1)
    P.write_text(S, encoding='utf-8')

py_compile.compile(str(P), doraise=True)
print('SLIQADIUS_APPROVED_LOGO_PATCH_OK')
