"""Utilitas HTTP bersama untuk fungsi Python (format handler Vercel: BaseHTTPRequestHandler)."""

from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

BATAS_BODY = 64 * 1024  # 64 KB cukup untuk jawaban 50 soal


class JsonHandler(BaseHTTPRequestHandler):
    """Dasar handler: baca/kirim JSON dengan pesan kesalahan berbahasa Indonesia."""

    def kirim(self, status: int, data: dict) -> None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def baca_json(self):
        panjang = int(self.headers.get("Content-Length") or 0)
        if panjang <= 0:
            return {}
        if panjang > BATAS_BODY:
            raise ValueError("Data yang dikirim terlalu besar.")
        try:
            return json.loads(self.rfile.read(panjang).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as e:
            raise ValueError("Format data bukan JSON yang valid.") from e

    def query(self) -> dict:
        return {k: v[0] for k, v in parse_qs(urlparse(self.path).query).items()}

    def do_OPTIONS(self):  # noqa: N802
        self.send_response(204)
        self.send_header("Allow", "GET, POST, OPTIONS")
        self.end_headers()

    def log_message(self, format, *args):  # noqa: A002 - senyapkan log bawaan
        return
