from pathlib import Path


def patch_web():
    p = Path("web.html")
    s = p.read_text(encoding="utf-8")
    marker = "SLIQADIUS_WEB_V10_RUNTIME"
    if marker not in s:
        anchor = "<script>\n(function(){"
        inject = (
            '<!-- SLIQADIUS_WEB_V10_RUNTIME -->\n'
            '<script src="groq-reliable.js?v=10"></script>\n'
            '<script src="sliq-i18n-loader.js?v=10"></script>\n'
            '<script src="sliq-google.js?v=10"></script>\n'
            '<script>\n(function(){'
        )
        if anchor not in s:
            raise RuntimeError("web.html inline-script anchor not found")
        s = s.replace(anchor, inject, 1)
        s = s.replace("</body>", '<script src="web-v10-extras.js?v=10"></script>\n</body>', 1)
    s = s.replace("logo.png?v=9", "logo.png?v=10")
    s = s.replace("render(1600,.82)", "render(1400,.76)")
    p.write_text(s, encoding="utf-8", newline="\n")


def patch_index():
    p = Path("index.html")
    s = p.read_text(encoding="utf-8")
    marker = "SLIQADIUS_SITE_V10_RUNTIME"
    if marker not in s:
        inject = (
            '<!-- SLIQADIUS_SITE_V10_RUNTIME -->\n'
            '<script src="sliq-i18n-loader.js?v=10"></script>\n'
            '<script src="sliq-google.js?v=10"></script>\n'
            '<script src="site-v10.js?v=10"></script>\n'
        )
        if "</body>" not in s:
            raise RuntimeError("index.html body end not found")
        s = s.replace("</body>", inject + "</body>", 1)
    s = s.replace("logo.png?v=5", "logo.png?v=10")
    p.write_text(s, encoding="utf-8", newline="\n")


def patch_install():
    p = Path("install.html")
    s = p.read_text(encoding="utf-8")
    old = "localStorage.setItem('sliqadius-lang',k)"
    new = "localStorage.setItem('sliqadius-lang',k);localStorage.setItem('sliq-web-lang',k)"
    if new not in s:
        if old not in s:
            raise RuntimeError("install.html language-storage anchor not found")
        s = s.replace(old, new, 1)
    s = s.replace("logo.png?v=6", "logo.png?v=10")
    p.write_text(s, encoding="utf-8", newline="\n")


patch_web()
patch_index()
patch_install()
print("Sliqadius web v10 integration applied")
