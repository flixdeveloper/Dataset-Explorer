# Frontend Design Document: Dataset Explorer & AI Insights

## 1. Overview
[cite_start]This project is a React-based web application where a user uploads a CSV dataset, explores its contents, and asks natural-language questions[cite: 24]. The application interfaces with a Python/FastAPI backend powered by a ReAct LLM agent.

## 2. Tech Stack
* **Framework:** React + Vite (TypeScript)
* **Styling:** Tailwind CSS
* **UI Components:** Shadcn UI (for clean, accessible components like Data Tables, Buttons, Dialogs, and ScrollAreas)
* **API Client:** Axios or native Fetch

## 3. Core Features & UI Layout
The application requires three main UI elements based on the requirements:
1.  [cite_start]**File Upload View:** A dedicated File upload UI[cite: 39]. A drag-and-drop zone that handles the initial CSV upload to transition the user to the main dashboard.
2.  [cite_start]**Dataset Viewer:** A Filterable / searchable table view[cite: 40]. Must handle pagination to maintain performance with large datasets.
3.  [cite_start]**AI Chat Panel:** An "Ask a question" input with LLM response panel[cite: 41]. Must display multi-turn chat history and loading states during LLM processing.

## 4. State Management Architecture
[cite_start]The evaluation criteria explicitly emphasize React state management and user experience[cite: 44]. 

**Global Application State:**
* `hasFile`: Boolean indicating if a dataset is currently loaded.
* `datasetHeaders`: Array of column names.
* `datasetRows`: Array of row objects for the current page.
* `totalRows`: Integer for pagination logic.

**Chat State:**
* `messages`: Array of objects `{ role: 'user' | 'assistant', content: string, context_used?: ContextUsed }`.
* `isAnalyzing`: Boolean for the loading spinner while the ReAct agent is running.

**Context Highlighting State (The "Wow" Factor):**
* `highlightedRows`: Array of integers (row indices) returned by the LLM.
* `highlightedColumns`: Array of strings (column names) returned by the LLM.
* *Logic:* When a user clicks on an AI message, the table should visually highlight the specific rows and columns the LLM used to formulate its answer.

## 5. API Integration Contract
The frontend will communicate with the following backend endpoints:

* [cite_start]**`POST /upload`**: To accept a CSV, parse it into memory or SQLite[cite: 28, 29, 30].
* [cite_start]**`GET /rows`**: To return rows with basic filtering or pagination[cite: 31, 32, 33]. 
    * *Params:* `page`, `limit`, `filter_col`, `filter_val`
* [cite_start]**`POST /ask`**: To accept a free-text question, query an LLM with relevant context, return a structured answer[cite: 34, 35, 36, 37].
    * *Payload:* `{ question: string }`
    * *Response:* `{ answer: string, context_used: { used_columns: string[], used_rows: int[] } }`