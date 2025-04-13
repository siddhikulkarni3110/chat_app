# server.py (FastAPI Backend)
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Store connected clients
clients: List[WebSocket] = []

# Allow CORS for frontend React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()  # Accept the WebSocket connection
    print(f"New connection from: {websocket.client}")
    clients.append(websocket)  # Add this WebSocket connection to the clients list

    try:
        while True:
            data = await websocket.receive_text()  # Receive text data from the client
            print(f"Received message: {data}")  # Log the message received from the client

            # Broadcast the message to all other clients
            for client in clients:
                if client != websocket:
                    await client.send_text(data)  # Send the message to all other clients
                    print(f"Message sent to {client.client}")
    except WebSocketDisconnect:
        print(f"Client disconnected: {websocket.client}")
        clients.remove(websocket)  # Remove the client when it disconnects

# For testing: simple HTML page to test WebSocket
@app.get("/")
def get():
    return """
    <html>
        <head><title>Chat</title></head>
        <body>
            <h1>FastAPI WebSocket Test</h1>
        </body>
    </html>
    """
