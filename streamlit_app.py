#!/usr/bin/env python3
"""
Good쌤 수업 대시보드 - React/Vite 실행 런처

이 파일을 React/Vite 프로젝트의 루트(package.json이 있는 폴더)에 두고 실행하세요.

실행:
    python run_app.py

기능:
1. Node.js / npm 설치 여부 확인
2. index.html 이름 보정
3. src/main.tsx 존재 여부 확인
4. GEMINI_API_KEY용 .env.local 확인/생성
5. node_modules가 없으면 npm install 자동 실행
6. Vite 개발 서버 실행
7. 브라우저 자동 열기
"""

from __future__ import annotations

import getpass
import os
import shutil
import socket
import subprocess
import sys
import threading
import time
import webbrowser
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
PORT = 3000
LOCAL_URL = f"http://localhost:{PORT}"


def print_header() -> None:
    print("=" * 62)
    print(" Good쌤 수업 대시보드 실행기")
    print("=" * 62)


def command_path(name: str) -> str | None:
    """Windows/macOS/Linux에서 실행 파일 경로 찾기."""
    return shutil.which(name) or shutil.which(f"{name}.cmd")


def check_required_files() -> None:
    """Vite 프로젝트 실행에 필요한 핵심 파일 확인."""
    package_json = BASE_DIR / "package.json"

    if not package_json.exists():
        raise FileNotFoundError(
            "package.json을 찾을 수 없습니다.\n"
            "run_app.py를 package.json과 같은 폴더에 넣어 주세요."
        )

    # 업로드/다운로드 과정에서 index(4).html처럼 이름이 바뀐 경우 자동 보정
    index_html = BASE_DIR / "index.html"
    if not index_html.exists():
        candidates = sorted(BASE_DIR.glob("index*.html"))
        if len(candidates) == 1:
            shutil.copy2(candidates[0], index_html)
            print(f"✓ {candidates[0].name} → index.html 복사 완료")
        else:
            raise FileNotFoundError(
                "index.html을 찾을 수 없습니다.\n"
                "Vite 프로젝트 루트에 index.html이 필요합니다."
            )

    # 현재 index.html이 /src/main.tsx를 불러오므로 반드시 필요
    main_tsx = BASE_DIR / "src" / "main.tsx"
    if not main_tsx.exists():
        raise FileNotFoundError(
            "src/main.tsx를 찾을 수 없습니다.\n\n"
            "현재 index.html은 /src/main.tsx를 실행하도록 되어 있습니다.\n"
            "Google AI Studio에서 다운로드한 원본 프로젝트의 src 폴더 전체를\n"
            "GitHub 저장소에 함께 업로드해 주세요."
        )


def check_node_and_npm() -> str:
    """Node.js와 npm 설치 여부를 확인하고 npm 실행 경로를 반환."""
    node = command_path("node")
    npm = command_path("npm")

    if not node:
        raise RuntimeError(
            "Node.js가 설치되어 있지 않습니다.\n"
            "Node.js LTS 버전을 먼저 설치한 뒤 다시 실행해 주세요."
        )

    if not npm:
        raise RuntimeError(
            "npm을 찾을 수 없습니다.\n"
            "Node.js를 정상 설치했는지 확인해 주세요."
        )

    node_version = subprocess.check_output(
        [node, "--version"], text=True, cwd=BASE_DIR
    ).strip()
    npm_version = subprocess.check_output(
        [npm, "--version"], text=True, cwd=BASE_DIR
    ).strip()

    print(f"✓ Node.js {node_version}")
    print(f"✓ npm {npm_version}")
    return npm


def prepare_env_file() -> None:
    """
    .env.local에 GEMINI_API_KEY가 없을 경우
    환경변수 또는 사용자 입력으로 생성한다.
    """
    env_file = BASE_DIR / ".env.local"

    if env_file.exists():
        text = env_file.read_text(encoding="utf-8", errors="ignore")
        if "GEMINI_API_KEY=" in text:
            print("✓ .env.local 확인 완료")
            return

    env_key = os.environ.get("GEMINI_API_KEY", "").strip()

    if not env_key and sys.stdin.isatty():
        print("\nGemini 기능을 사용하려면 GEMINI_API_KEY가 필요합니다.")
        print("키를 입력하지 않고 Enter를 누르면 서버 실행만 계속합니다.")
        env_key = getpass.getpass("GEMINI_API_KEY: ").strip()

    if env_key:
        # GitHub에는 절대 올리지 않도록 .gitignore에 포함해야 함
        existing = ""
        if env_file.exists():
            existing = env_file.read_text(encoding="utf-8", errors="ignore").rstrip()

        lines = [line for line in existing.splitlines()
                 if not line.startswith("GEMINI_API_KEY=")]
        lines.append(f"GEMINI_API_KEY={env_key}")
        env_file.write_text("\n".join(lines) + "\n", encoding="utf-8")
        print("✓ .env.local 생성/갱신 완료")
    else:
        print("! GEMINI_API_KEY가 없습니다.")
        print("  화면은 실행될 수 있지만 Gemini API 기능은 동작하지 않을 수 있습니다.")


def install_dependencies(npm: str) -> None:
    """node_modules가 없을 때 npm install 실행."""
    node_modules = BASE_DIR / "node_modules"
    if node_modules.exists():
        print("✓ node_modules 확인 완료")
        return

    print("\n의존성 패키지를 설치합니다: npm install")
    subprocess.run([npm, "install"], cwd=BASE_DIR, check=True)
    print("✓ 패키지 설치 완료")


def port_is_open(port: int) -> bool:
    try:
        with socket.create_connection(("127.0.0.1", port), timeout=0.4):
            return True
    except OSError:
        return False


def open_browser_when_ready() -> None:
    """Vite 서버가 열리면 기본 브라우저에서 앱을 연다."""
    for _ in range(120):
        if port_is_open(PORT):
            webbrowser.open(LOCAL_URL)
            return
        time.sleep(0.25)


def run_vite(npm: str) -> int:
    """Vite 개발 서버 실행."""
    if port_is_open(PORT):
        raise RuntimeError(
            f"{PORT}번 포트를 이미 다른 프로그램이 사용 중입니다.\n"
            f"기존 서버를 종료한 뒤 다시 실행해 주세요."
        )

    print(f"\n앱을 실행합니다: {LOCAL_URL}")
    print("종료하려면 이 터미널에서 Ctrl+C를 누르세요.\n")

    threading.Thread(
        target=open_browser_when_ready,
        daemon=True,
    ).start()

    # package.json의 dev 명령을 사용하되 포트 충돌 시 자동 변경되지 않도록 strictPort 적용
    process = subprocess.Popen(
        [
            npm,
            "run",
            "dev",
            "--",
            "--port",
            str(PORT),
            "--host",
            "0.0.0.0",
            "--strictPort",
        ],
        cwd=BASE_DIR,
    )

    try:
        return process.wait()
    except KeyboardInterrupt:
        print("\n서버를 종료합니다.")
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
        return 0


def main() -> int:
    print_header()

    try:
        check_required_files()
        npm = check_node_and_npm()
        prepare_env_file()
        install_dependencies(npm)
        return run_vite(npm)

    except (FileNotFoundError, RuntimeError) as exc:
        print(f"\n[실행 중단]\n{exc}")
        return 1

    except subprocess.CalledProcessError as exc:
        print(f"\n[npm 실행 오류]\n명령 실행에 실패했습니다: {exc}")
        return exc.returncode or 1

    except Exception as exc:
        print(f"\n[예상하지 못한 오류]\n{exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
