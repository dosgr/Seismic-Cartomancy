"""Package this tree into rebuildable source and static-installation ZIP files."""
from argparse import ArgumentParser
from io import BytesIO
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

root = Path(__file__).resolve().parent
parser = ArgumentParser(description=__doc__)
parser.add_argument("--out-dir", type=Path, default=root / "releases")
parser.add_argument("--personal-support-dir", type=Path, help="Build a separate personal ZIP using an extracted SEISMO v1.1.1 personal package")
args = parser.parse_args()
version = json.loads((root / "package.json").read_text(encoding="utf8"))["version"]
output = args.out_dir.resolve()
output.mkdir(parents=True, exist_ok=True)

common = ["index.html", "verify.html", "style.css", "stations.txt", "donate-config.js", "LICENSE", "README.md", "CHANGELOG.md", ".htaccess", "manifest-el.json", "manifest-en.json"]
runtime = [root / name for name in common]
for folder in ("assets", "data", "docs", "js", "en", "css"):
    runtime.extend(path for path in (root / folder).rglob("*")
                   if path.is_file() and not path.is_relative_to(root / "assets/support/qr"))
source = runtime + [root / name for name in ("package.json", "dev.py", "release.py")]
source.extend(path for path in (root / "tests").rglob("*") if path.is_file() and "__pycache__" not in path.parts)


def add(archive, name, content):
    info = ZipInfo(name)
    info.compress_type = ZIP_DEFLATED
    info.external_attr = 0o100644 << 16
    archive.writestr(info, content, compresslevel=8)


def archive_bytes(files, bundled_source=None, overrides=None):
    entries = {path.relative_to(root).as_posix(): path for path in files}
    if overrides:
        entries.update(overrides)
    stream = BytesIO()
    with ZipFile(stream, "w") as archive:
        for name, path in sorted(entries.items()):
            add(archive, name, path.read_bytes())
        if bundled_source is not None:
            add(archive, "Seismiki-Chartomanteia-source.zip", bundled_source)
            add(archive, "source.zip", bundled_source)
    return stream.getvalue()


def public_config_is_safe(path):
    contents = path.read_text(encoding="utf8")
    return all(line.strip() == match for line, match in zip(contents.splitlines(), (
        "// Public defaults. Payment destinations and matching QR images are optional.",
        "window.SEISMO_DONATE_CONFIG = {",
        "support: false,",
        "professional: true,",
        'bitcoin: { enabled: false, address: "", qr: "" },',
        'revolut: { enabled: false, url: "", qr: "" },',
        'paypal: { enabled: false, url: "", qr: "" },',
        'facebook: { enabled: false, url: "", qr: "" },',
        "};",
    ))) and len(contents.splitlines()) == 9


if not public_config_is_safe(root / "donate-config.js"):
    parser.error("Restore the public donate-config.js before building. Use --personal-support-dir for personal deployment.")

source_zip = archive_bytes(source)
name = f"Seismic-Cartomancy-v{version}"
public_install = archive_bytes(runtime, source_zip)
artifacts = {output / f"{name}-source.zip": source_zip, output / f"{name}-cPanel-public.zip": public_install}

if args.personal_support_dir:
    upstream = args.personal_support_dir.resolve()
    private_names = ["donate-config.js", *(f"assets/support/qr/{method}.png" for method in ("bitcoin", "revolut", "paypal", "facebook"))]
    private_files = {name: upstream / name for name in private_names}
    if any(not path.is_file() for path in private_files.values()):
        parser.error("The personal package must contain donate-config.js and all four QR PNG files.")
    artifacts[output / "personal" / f"{name}-cPanel.zip"] = archive_bytes(runtime, source_zip, private_files)

for path, content in artifacts.items():
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(content)
    print(path)
