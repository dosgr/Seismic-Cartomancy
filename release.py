"""Package this tree into rebuildable source and static-installation ZIP files."""
from argparse import ArgumentParser
from io import BytesIO
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

root = Path(__file__).resolve().parent
parser = ArgumentParser(description=__doc__)
parser.add_argument("--out-dir", type=Path, default=root / "releases")
args = parser.parse_args()
version = json.loads((root / "package.json").read_text(encoding="utf8"))["version"]
output = args.out_dir.resolve()
output.mkdir(parents=True, exist_ok=True)

common = ["index.html", "verify.html", "style.css", "stations.txt", "LICENSE", "README.md", "CHANGELOG.md", ".htaccess", "manifest-el.json", "manifest-en.json"]
runtime = [root / name for name in common]
for folder in ("assets", "data", "docs", "js", "en"):
    runtime.extend(path for path in (root / folder).rglob("*") if path.is_file())
source = runtime + [root / name for name in ("package.json", "dev.py", "release.py")]
source.extend(path for path in (root / "tests").rglob("*") if path.is_file() and "__pycache__" not in path.parts)


def add(archive, name, content):
    info = ZipInfo(name)
    info.compress_type = ZIP_DEFLATED
    info.external_attr = 0o100644 << 16
    archive.writestr(info, content, compresslevel=8)


def archive_bytes(files, bundled_source=None):
    stream = BytesIO()
    with ZipFile(stream, "w") as archive:
        for path in sorted(files):
            add(archive, path.relative_to(root).as_posix(), path.read_bytes())
        if bundled_source is not None:
            add(archive, "Seismiki-Chartomanteia-source.zip", bundled_source)
            add(archive, "source.zip", bundled_source)
    return stream.getvalue()


source_zip = archive_bytes(source)
install_zip = archive_bytes(runtime, source_zip)
for suffix, content in (("source", source_zip), ("install", install_zip)):
    path = output / f"Seismiki-Chartomanteia-{version}-{suffix}.zip"
    path.write_bytes(content)
    print(path)
