#!/usr/bin/env python3
"""
Simple HTTP server to run the typing test HTML file locally.
"""

import http.server
import socketserver
import webbrowser
import os
from pathlib import Path

# Configuration
PORT = 8000
DIRECTORY = Path(__file__).parent

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)

def main():
    """Start the HTTP server and open the browser."""
    
    # Change to the script directory
    os.chdir(DIRECTORY)
    
    # Create server
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        url = f"http://localhost:{PORT}/typing_test.html"
        
        print("=" * 60)
        print(f"🚀 Typing Speed Test Server Started!")
        print("=" * 60)
        print(f"📍 Server running at: http://localhost:{PORT}")
        print(f"📄 Opening typing test at: {url}")
        print("=" * 60)
        print("Press Ctrl+C to stop the server")
        print("=" * 60)
        
        # Open browser
        webbrowser.open(url)
        
        # Start serving
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Server stopped. Goodbye!")

if __name__ == "__main__":
    main()
