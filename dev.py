"""Serve the development tree locally. Accept the managed preview's host/port arguments."""
from argparse import ArgumentParser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

parser = ArgumentParser()
parser.add_argument("--host", default="127.0.0.1")
parser.add_argument("--port", type=int, default=4173)
parser.add_argument("--strictPort", action="store_true")
args = parser.parse_args()
handler = partial(SimpleHTTPRequestHandler, directory=str(Path(__file__).resolve().parent))
with ThreadingHTTPServer((args.host, args.port), handler) as server:
    print(f"Listening at http://{args.host}:{args.port}/", flush=True)
    server.serve_forever()
