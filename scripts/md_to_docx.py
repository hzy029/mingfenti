"""
将 Markdown 转为 Word (.docx)。依赖 pandoc，推荐安装：
  pip install pypandoc_binary

用法：
  python scripts/md_to_docx.py docs/question-bank-material-map.md
  python scripts/md_to_docx.py path/to/note.md -o out/custom.docx
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Markdown → Word (.docx)")
    p.add_argument("input_md", type=Path, help="输入 .md 路径")
    p.add_argument(
        "-o",
        "--output",
        type=Path,
        default=None,
        help="输出 .docx（默认：与 md 同名同目录）",
    )
    args = p.parse_args(argv)

    src = args.input_md.resolve()
    if not src.is_file():
        print(f"找不到文件：{src}", file=sys.stderr)
        return 1

    dst = args.output.resolve() if args.output else src.with_suffix(".docx")

    try:
        import pypandoc
    except ImportError:
        print("请先安装：python -m pip install pypandoc_binary", file=sys.stderr)
        return 1

    dst.parent.mkdir(parents=True, exist_ok=True)
    pypandoc.convert_file(
        str(src),
        "docx",
        outputfile=str(dst),
        extra_args=["--standalone"],
    )
    print(f"已写入：{dst}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
