#!/usr/bin/env python3
"""Run the offline academy on localhost using only Python's standard library."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
import webbrowser

HOST = "127.0.0.1"
PORT = 8000
ROOT = Path(__file__).resolve().parent

class AcademyHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        print("[academy] " + (fmt % args))

def main():
    os.chdir(ROOT)
    server = ThreadingHTTPServer((HOST, PORT), AcademyHandler)
    url = f"http://{HOST}:{PORT}"
    print(f"آکادمی ریاضی و علم داده فعال شد: {url}")
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
