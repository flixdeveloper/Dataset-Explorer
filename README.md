# Dataset Explorer
A full-stack web application for uploading CSV datasets, exploring their contents, and gaining natural-language AI insights.

## Screenshots
[SCREENSHOTS]

## Architecture Overview
[replace me with <High-Level Data Flow>]

## API Endpoints

| Endpoint | Method | Description / Purpose |
| --- | --- | --- |
| `/upload` | POST | Accepts a CSV file upload, parses its contents, and loads it into memory/database. |
| `/rows` | GET | Returns rows from the uploaded dataset, supporting basic filtering and pagination. |
| `/ask` | POST | Accepts a free-text natural language question and returns an AI-generated answer based on the dataset. |
| `/suggestions` | GET | AI-generated starter questions |

## Typical User Journey

* User uploads CSV on Home → POST `/upload` → backend stores DataFrame.
* Frontend fetches page 1 → GET `/rows` → navigates to DataView.
* ChatPanel loads suggestions → GET `/suggestions` (Gemini reads schema).
* User asks a question → POST `/ask` → Claude runs SQL via DuckDB → answer shown in chat.
* User browses table: server pagination + client sort/filter on the current page.

## Getting Started — Run Locally

### Prerequisites
Install the following before you begin:
* Python - 3.10+
* Node.js - 20+

### 1. Clone the repository
```bash
git clone [https://github.com/flixdeveloper/Dataset-Explorer](https://github.com/flixdeveloper/Dataset-Explorer)
cd Dataset-Explorer
```

### 2. Configure environment variables
Create a `.env` file in the Backend directory with the following configuration:

| Argument | Description | Required |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Anthropic API key used by LLMService to run the Claude ReAct agent for natural-language Q&A via POST `/ask`. | Yes |
| `GOOGLE_API_KEY` | Google Gemini API key used by LLMService to generate starter chat questions via GET `/suggestions`. | No |
| `FRONTEND_URL` | Origin URL allowed by FastAPI CORS middleware (e.g. `http://localhost:5173`). | No |

### 3. Start the backend
Open a terminal and run:
```bash
cd Backend
python -m venv venv
```

### 4. Start the frontend
Open a second terminal (keep the backend running):
```bash
cd frontend
npm install
npm run dev
```

### 5. Open the app
Open `http://localhost:5173` in your browser.

## What I'd Do Next

* **Expose the platform as a Model Context Protocol (MCP) server:** Implement an MCP server interface to allow external AI agents and development tools to natively connect to the application, enabling them to query, filter, and extract insights from the uploaded datasets through a standardized protocol.
* **Support concurrent multi-user and multi-file workflows:** Transition the backend architecture from temporary single-session storage to a scalable database solution with proper session isolation, allowing multiple users to manage and explore multiple datasets simultaneously.
* **Implement intelligent data highlighting in the UI:** Enhance the user interface to dynamically highlight the exact rows and columns referenced or utilized by the LLM when generating a specific insight, improving data auditability and overall UX.
