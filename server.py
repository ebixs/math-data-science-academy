#!/usr/bin/env python3
"""Local server for the offline academy, including durable progress storage."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import os
import webbrowser

HOST = "127.0.0.1"
PORT = 8000
ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
PROGRESS_FILE = DATA_DIR / "progress.json"
MAX_BODY_BYTES = 2_000_000

class AcademyHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def _json(self, status, payload):
        raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self):
        if self.path.split("?", 1)[0] == "/api/progress":
            try:
                if PROGRESS_FILE.exists():
                    with PROGRESS_FILE.open("r", encoding="utf-8") as f:
                        payload = json.load(f)
                else:
                    payload = {}
                return self._json(200, payload)
            except (OSError, json.JSONDecodeError) as exc:
                return self._json(500, {"error": "Could not read progress file", "detail": str(exc)})
        return super().do_GET()

    def do_POST(self):
        if self.path.split("?", 1)[0] != "/api/progress":
            return self._json(404, {"error": "Not found"})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_BODY_BYTES:
                return self._json(413, {"error": "Invalid payload size"})
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            if not isinstance(payload, dict):
                return self._json(400, {"error": "Progress must be a JSON object"})
            DATA_DIR.mkdir(parents=True, exist_ok=True)
            temporary = PROGRESS_FILE.with_suffix(".json.tmp")
            with temporary.open("w", encoding="utf-8") as f:
                json.dump(payload, f, ensure_ascii=False, indent=2)
                f.write("\n")
            temporary.replace(PROGRESS_FILE)
            return self._json(200, {"ok": True, "saved_to": "data/progress.json"})
        except (ValueError, UnicodeDecodeError, OSError, json.JSONDecodeError) as exc:
            return self._json(400, {"error": "Could not save progress", "detail": str(exc)})

    def log_message(self, fmt, *args):
        print("[academy] " + (fmt % args))

def main():
    os.chdir(ROOT)
    server = ThreadingHTTPServer((HOST, PORT), AcademyHandler)
    url = f"http://{HOST}:{PORT}"
    print(f"آکادمی ریاضی و علم داده فعال شد: {url}")
    print("پیشرفت‌ها در پوشه data/progress.json ذخیره می‌شوند.")
    print("برای توقف سرور Control+C را بزنید.")
    try:
        webbrowser.open(url)
    except Exception:
        pass
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nسرور متوقف شد.")
    finally:
        server.server_close()

if __name__ == "__main__":
    main()
