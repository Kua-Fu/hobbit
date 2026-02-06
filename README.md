# Hobbit

> One Ring to rule them all, One Ring to find them, One Ring to bring them all, and in the darkness bind them

Hobbit is a premium, beautifully designed developer utility suite. It transforms complex strings, serialized JSON, timestamps, and base-encoded data into readable, structured, and interactive formats.

![Product Preview](preview.svg)

## Features

-   **✨ Multi-Tool Support**: Toggle seamlessly between JSON Formatter, Timestamp Converter, and Base Encoder/Decoder.
-   **📦 JSON Structurer**: Automatically parses and formats nested serialized JSON strings with gutter-style folding and line numbers.
-   **🕙 Timestamp Converter**: Real-time timestamp display with support for Seconds, Milliseconds, Microseconds, and Nanoseconds.
-   **🔠 Base Converter**: Encode and decode strings in Base64 and Base32 with swap support.
-   **💎 Premium UI**: Sleek, dark-themed interface with glassmorphism and smooth animations.
-   **⚡ High Performance**: Fast processing with Go-powered backend and Vite-powered frontend.

## Tech Stack

-   **Frontend**: React, Vite, TypeScript, Lucide Icons
-   **Backend**: Go (Gin framework)
-   **Styling**: Modern CSS with Glassmorphism
-   **Date Handling**: date-fns & date-fns-tz

## Getting Started

### Prerequisites

-   Node.js (v18+)
-   Go (v1.20+)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/hobbit.git
    cd hobbit
    ```

2.  **Start the Backend:**
    ```bash
    cd backend
    go run main.go
    ```
    The server runs on `http://localhost:8080`.

3.  **Start the Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## Usage

1.  **JSON Formatter**: Paste any JSON or escaped string. Use the gutter triangles to fold/unfold nested objects.
2.  **Timestamp**: Switch to the Timestamp tab for real-time tracking and conversion between various units and timezones.
3.  **Base**: Encode or Decode strings using Base64 or Base32. Use the swap button to quickly flip input and output.

## License

MIT
