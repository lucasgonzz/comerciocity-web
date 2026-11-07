"""Sirve un build de ensayo en loopback. Sólo librería estándar, sin cliente HTTP saliente.

python scripts/serve-static-qa.py .preview.local/build --port 5183
"""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


class StaticQAHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Rutas de Vue: sirven el índice compilado, nunca un proxy externo.
        route = urlsplit(self.path).path
        if not Path(route).suffix:
            self.path = "/index.html"
        super().do_GET()

    def end_headers(self):
        # Defensa adicional para QA: no permite conexiones externas a analítica o APIs.
        self.send_header("Content-Security-Policy", "; ".join([
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
            "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:",
            "img-src 'self' data:",
            "media-src 'self' https://videos.comerciocity.store",
            "connect-src 'self'",
            "frame-src 'none'",
            "object-src 'none'",
            "base-uri 'self'",
        ]))
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory")
    parser.add_argument("--port", type=int, default=5183)
    args = parser.parse_args()
    root = Path(args.directory).resolve(strict=True)
    if not (root / "index.html").is_file():
        raise SystemExit("Falta index.html del build compilado")
    handler = partial(StaticQAHandler, directory=str(root))
    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    print(f"Ensayo estático sólo local: http://127.0.0.1:{args.port}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
