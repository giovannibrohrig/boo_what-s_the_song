#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS for local audio testing
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

def run():
    os.chdir(DIRECTORY)
    port = PORT
    server = None
    
    # Find open port
    for p in range(PORT, PORT + 20):
        try:
            socketserver.TCPServer.allow_reuse_address = True
            server = socketserver.TCPServer(("", p), Handler)
            port = p
            break
        except OSError:
            continue

    if not server:
        print("❌ Não foi possível abrir uma porta para o servidor.")
        sys.exit(1)

    url = f"http://localhost:{port}/index.html"
    print("\n" + "="*55)
    print(" 🎃👻 BOO! WHAT'S THE SOUND? - SERVIDOR INICIADO 🎃👻")
    print("="*55)
    print(f"\n👉 Acesse no seu navegador: {url}")
    print("\nPressione Ctrl+C para encerrar o servidor.\n")

    try:
        webbrowser.open(url)
    except Exception:
        pass

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🎃 Servidor finalizado com sucesso!")
        server.server_close()

if __name__ == "__main__":
    run()
