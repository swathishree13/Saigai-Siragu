from __future__ import annotations

import http.server
import json
import mimetypes
import os
import shutil
import subprocess
import tempfile
from email import policy
from email.parser import BytesParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", os.environ.get("CLEARSTAGE_PORT", "8000")))
ALLOWED_ORIGIN = os.environ.get("CLEARSTAGE_ALLOWED_ORIGIN", "*")


def find_converter():
    candidates = [
        shutil.which("soffice"),
        shutil.which("libreoffice"),
        os.environ.get("PROGRAMFILES", "") + "\\LibreOffice\\program\\soffice.exe",
        os.environ.get("PROGRAMFILES(X86)", "") + "\\LibreOffice\\program\\soffice.exe",
    ]
    return next((path for path in candidates if path and Path(path).is_file()), None)


class ClearStageHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        request_origin = self.headers.get("Origin")
        if ALLOWED_ORIGIN == "*" or request_origin == ALLOWED_ORIGIN:
            self.send_header("Access-Control-Allow-Origin", ALLOWED_ORIGIN if ALLOWED_ORIGIN != "*" else "*")
            self.send_header("Vary", "Origin")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_OPTIONS(self):
        if urlparse(self.path).path != "/api/render-pptx":
            self.send_error(404, "Endpoint not found")
            return
        self.send_response(204)
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        if urlparse(self.path).path != "/api/render-pptx":
            self.send_error(404, "Endpoint not found")
            return

        converter = find_converter()
        if not converter:
            self.send_json(503, {
            "error": "PPTX rendering needs LibreOffice. Install it, then restart py server.py.",
                "install": "https://www.libreoffice.org/download/download/"
            })
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            request_body = self.rfile.read(content_length)
            message = BytesParser(policy=policy.default).parsebytes(
                b"Content-Type: " + self.headers.get("Content-Type", "").encode("ascii")
                + b"\r\nMIME-Version: 1.0\r\n\r\n" + request_body
            )
            upload = next(
                (part for part in message.iter_parts()
                 if part.get_param("name", header="content-disposition") == "file"),
                None,
            )
            if upload is None:
                raise ValueError("No presentation file was uploaded.")
            filename = Path(upload.get_filename() or "presentation.pptx").name
            if filename.lower().endswith(".ppt"):
                raise ValueError("Old .ppt files must be saved as .pptx first.")
            if not filename.lower().endswith(".pptx"):
                raise ValueError("Only .pptx files are supported.")
            content = upload.get_payload(decode=True) or b""
            if not content:
                raise ValueError("The uploaded presentation is empty.")

            with tempfile.TemporaryDirectory(prefix="clearstage-") as temp_dir:
                temp_path = Path(temp_dir)
                source = temp_path / filename
                source.write_bytes(content)
                result = subprocess.run(
                    [converter, "--headless", "--convert-to", "pdf", "--outdir", str(temp_path), str(source)],
                    capture_output=True,
                    text=True,
                    timeout=120,
                    check=False,
                )
                output = source.with_suffix(".pdf")
                if result.returncode != 0 or not output.exists():
                    detail = (result.stderr or result.stdout).strip() or "LibreOffice could not convert the file."
                    raise RuntimeError(detail)
                pdf = output.read_bytes()

            self.send_response(200)
            self.send_header("Content-Type", "application/pdf")
            self.send_header("Content-Length", str(len(pdf)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(pdf)
        except (KeyError, ValueError, RuntimeError, OSError, subprocess.SubprocessError) as error:
            self.send_json(400, {"error": str(error)})

    def send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    server = http.server.ThreadingHTTPServer((HOST, PORT), ClearStageHandler)
    print(f"ClearStage running at http://{HOST}:{PORT}")
    print(f"PPTX rendering uses: {find_converter() or 'LibreOffice not found'}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping ClearStage")
    finally:
        server.server_close()
