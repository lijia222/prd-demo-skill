#!/usr/bin/env python3
"""Shared installer logic for prd-demo-skill."""
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

MARKER_PREFIX = "<!-- prd-demo-managed:"
MARKER_SUFFIX = " -->"
PACKAGE_ROOT = Path(__file__).resolve().parent.parent
CORE_ROOT = PACKAGE_ROOT / "core"
MANIFEST_PATH = PACKAGE_ROOT / "manifest.json"


def load_manifest() -> dict:
    return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))


def package_version() -> str:
    return load_manifest()["version"]


def marker(version: str) -> str:
    return f"{MARKER_PREFIX} {version}{MARKER_SUFFIX}"


def is_managed(path: Path) -> bool:
    if not path.is_file():
        return False
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return False
    return MARKER_PREFIX in text


def marked_text(text: str, version: str) -> str:
    tag = marker(version)
    if tag in text:
        return text
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end >= 0:
            insert_at = end + len("\n---")
            return text[:insert_at] + "\n\n" + tag + text[insert_at:]
    return tag + "\n" + text


def read_project(path_value: str | None) -> Path | None:
    if path_value is None:
        return Path.cwd()
    path = Path(path_value).expanduser().resolve()
    if not path.is_dir():
        raise ValueError(f"项目路径不是目录：{path}")
    return path


def looks_like_project(path: Path) -> bool:
    return any((path / name).exists() for name in (".git", ".vscode", ".github", "package.json", "AGENTS.md", "CLAUDE.md"))


def source_files() -> dict[str, str]:
    files = {}
    for path in sorted(CORE_ROOT.rglob("*")):
        if path.is_file():
            files[str(path.relative_to(CORE_ROOT))] = path.read_text(encoding="utf-8")
    return files


def target_roots(agent: str, project: Path | None) -> list[tuple[str, Path]]:
    home = Path.home()
    if agent == "claude":
        return [("claude", home / ".claude" / "skills" / "prd-demo")]
    if agent == "codex":
        if os.environ.get("CODEX_HOME"):
            root = Path(os.environ["CODEX_HOME"]).expanduser().resolve() / "skills" / "prd-demo"
        elif project is not None:
            root = project / ".agents" / "skills" / "prd-demo"
        else:
            raise ValueError("Codex 未设置 CODEX_HOME；请用 --project 指定项目目录")
        return [("codex", root)]
    if agent == "copilot":
        if project is None or not looks_like_project(project):
            raise ValueError("Copilot 需要目标项目目录；请使用 --project，或在项目工作区执行")
        return [("copilot", project / ".github")]
    raise ValueError(f"未知 Agent：{agent}")


def detect_agents(project: Path | None) -> list[str]:
    found = []
    if shutil.which("claude") or (Path.home() / ".claude").is_dir():
        found.append("claude")
    if shutil.which("codex") or os.environ.get("CODEX_HOME") or (project and (project / ".agents").is_dir()):
        found.append("codex")
    if project and looks_like_project(project) and ((project / ".vscode").exists() or (project / ".github").exists()):
        found.append("copilot")
    return found


def desired_files(kind: str, root: Path, version: str) -> dict[Path, str]:
    files = source_files()
    result: dict[Path, str] = {}
    if kind in ("claude", "codex"):
        for relative, text in files.items():
            result[root / relative] = marked_text(text, version)
    elif kind == "copilot":
        adapter = PACKAGE_ROOT / "adapters" / "vscode-copilot"
        for name in ("copilot-instructions.md",):
            result[root / name] = marked_text((adapter / name).read_text(encoding="utf-8"), version)
        prompt_dir = root / "prompts"
        result[prompt_dir / "prd-demo.prompt.md"] = marked_text((adapter / "prd-demo.prompt.md").read_text(encoding="utf-8"), version)
    else:
        raise ValueError(f"未知目标类型：{kind}")
    result[root / ".prd-demo-version.json"] = json.dumps({"managedBy": "prd-demo", "version": version}, ensure_ascii=False, indent=2) + "\n"
    return result


def managed_version_file(path: Path) -> bool:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data.get("managedBy") == "prd-demo"
    except (OSError, ValueError, AttributeError):
        return False


def existing_managed(path: Path) -> bool:
    return is_managed(path) or (path.name == ".prd-demo-version.json" and managed_version_file(path))


def preflight(desired: dict[Path, str]) -> list[Path]:
    stale = []
    for path in desired:
        if path.exists() and path.is_symlink():
            raise ValueError(f"目标是符号链接，拒绝覆盖：{path}")
        if path.exists() and not existing_managed(path):
            raise ValueError(f"目标文件未由 prd-demo 管理，拒绝覆盖：{path}")
    roots = {path.parent for path in desired}
    for root in roots:
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if path.is_file() and path not in desired and existing_managed(path):
                stale.append(path)
    return stale


def atomic_write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as handle:
        handle.write(text)
        temp_path = Path(handle.name)
    os.replace(temp_path, path)


def apply_install(targets: list[tuple[str, Path]], version: str, dry_run: bool) -> None:
    plans = []
    for kind, root in targets:
        desired = desired_files(kind, root, version)
        stale = preflight(desired)
        plans.append((kind, root, desired, stale))
    for kind, root, desired, stale in plans:
        print(f"[{kind}] 目标：{root}")
        for path in desired:
            print(f"  写入：{path}")
        for path in stale:
            print(f"  删除旧管理文件：{path}")
        if not dry_run:
            for path, text in desired.items():
                atomic_write(path, text)
            for path in stale:
                path.unlink()


def uninstall_targets(targets: list[tuple[str, Path]], dry_run: bool) -> None:
    for kind, root in targets:
        if not root.exists():
            print(f"[{kind}] 未安装：{root}")
            continue
        managed = [p for p in root.rglob("*") if p.is_file() and existing_managed(p)]
        print(f"[{kind}] 目标：{root}")
        for path in managed:
            print(f"  删除：{path}")
        if not dry_run:
            for path in managed:
                path.unlink()
            for directory in sorted((p for p in root.rglob("*") if p.is_dir()), reverse=True):
                try:
                    directory.rmdir()
                except OSError:
                    pass


def selected_targets(agent: str, project: Path | None) -> list[tuple[str, Path]]:
    agents = detect_agents(project) if agent == "auto" else [agent]
    if not agents:
        raise ValueError("未探测到可用 Agent；请使用 --agent claude|codex|copilot")
    result = []
    for name in agents:
        result.extend(target_roots(name, project))
    return result


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Install the prd-demo skill")
    parser.add_argument("command", nargs="?", choices=("install", "update", "uninstall"), default="install")
    parser.add_argument("--target", choices=("auto", "claude", "codex", "copilot"), default="auto")
    parser.add_argument("--agent", choices=("claude", "codex", "copilot"), help="选择单个 Agent")
    parser.add_argument("--project", help="VS Code/Codex 项目路径")
    parser.add_argument("--version", help="校验包版本，例如 v1.0.0 或 1.0.0")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args(argv)
    try:
        version = package_version()
        if args.version and args.version.lstrip("v") != version:
            raise ValueError(f"当前包版本是 {version}，不能安装指定版本 {args.version}")
        project = read_project(args.project)
        agent = args.agent or args.target
        targets = selected_targets(agent, project)
        if args.command == "uninstall":
            uninstall_targets(targets, args.dry_run)
        else:
            apply_install(targets, version, args.dry_run)
        if args.dry_run:
            print("dry-run：未修改文件")
        return 0
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"prd-demo 安装失败：{error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
