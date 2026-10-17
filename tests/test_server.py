"""Integration tests for the local progress API; uses temporary storage only."""
import importlib.util
import json
from http.client import HTTPConnection
from pathlib import Path
import tempfile
import threading
import unittest
from http.server import ThreadingHTTPServer

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("academy_server", ROOT / "server.py")
SERVER_MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(SERVER_MODULE)


class ProgressAPITests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp_dir = tempfile.TemporaryDirectory()
        SERVER_MODULE.DATA_DIR = Path(cls.temp_dir.name) / "data"
        SERVER_MODULE.PROGRESS_FILE = SERVER_MODULE.DATA_DIR / "progress.json"
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), SERVER_MODULE.AcademyHandler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.port = cls.server.server_address[1]

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=3)
        cls.temp_dir.cleanup()

    def request(self, method, path, payload=None):
        conn = HTTPConnection("127.0.0.1", self.port, timeout=3)
        body = None if payload is None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
        headers = {"Content-Type": "application/json"} if body is not None else {}
        conn.request(method, path, body=body, headers=headers)
        response = conn.getresponse()
        data = response.read()
        status = response.status
        conn.close()
        return status, json.loads(data.decode("utf-8"))

    def test_get_missing_progress_returns_empty_object(self):
        status, data = self.request("GET", "/api/progress")
        self.assertEqual(status, 200)
        self.assertEqual(data, {})

    def test_post_persists_and_get_reads_progress(self):
        payload = {"completedLessons": ["00"], "notes": "یادداشت فارسی", "score": 4}
        status, response = self.request("POST", "/api/progress", payload)
        self.assertEqual(status, 200)
        self.assertTrue(response["ok"])
        status, saved = self.request("GET", "/api/progress")
        self.assertEqual(status, 200)
        self.assertEqual(saved, payload)

    def test_non_object_json_is_rejected(self):
        conn = HTTPConnection("127.0.0.1", self.port, timeout=3)
        conn.request("POST", "/api/progress", body='["not", "an object"]',
                     headers={"Content-Type": "application/json"})
        response = conn.getresponse()
        data = json.loads(response.read().decode("utf-8"))
        conn.close()
        self.assertEqual(response.status, 400)
        self.assertIn("error", data)

    def test_unknown_api_path_is_not_found(self):
        status, data = self.request("POST", "/api/unknown", {"x": 1})
        self.assertEqual(status, 404)
        self.assertEqual(data["error"], "Not found")


if __name__ == "__main__":
    unittest.main()
