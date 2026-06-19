# Backend Architecture Design: Text-to-SQL Engine with DuckDB

## Overview
This backend leverages an advanced Agentic AI Workflow using a **Text-to-SQL** pattern. Instead of passing massive raw datasets to the LLM (which introduces token limits, high latency, and financial costs), the system acts as an orchestrator: using the LLM to understand intent and generate structured SQL, while executing the calculation deterministically on a local high-performance OLAP database (**DuckDB**).

---

## Architecture Components

### 1. Data Ingestion & Sanitization (`DataService`)
* **Extract & Transform:** Pandas handles initial file loading (`pd.read_csv`), dual-encoding detection (supporting Hebrew `windows-1255`), and data cleaning (mapping `NaN` to `None`).
* **In-Memory Storage:** The dataset is held as an in-memory Pandas DataFrame.
* **Execution Engine:** DuckDB queries the Pandas DataFrame directly in-memory, providing sub-millisecond execution without requiring explicit database migration or data duplication.

### 2. Cognitive Routing & Summarization (`LLMService`)
* **Target Model:** `gemini-2.5-flash` via the official `google-genai` SDK.
* **Structured Outputs:** Enforces strict Pydantic JSON schemas via the API to eliminate parsing errors.
* **Two-Step Processing (Agentic Loop):**
  1. **Routing/Translation:** Takes the user's natural language question and the table's schema, returning a structured decision object (`LLMDecision`) stating whether SQL is needed and generating the exact query.
  2. **Summarization:** Receives the raw mathematical output from DuckDB and rewrites it into a polished, human-friendly response aligned with the user's original language.

---

## Data Flow Diagram

1. **User Query** -> API Gateway (`POST /api/ask`).
2. **Router** fetches Column Schemas from `DataService` (Zero data leaves the server).
3. **LLM Service** analyzes schema + query -> Returns a structured SQL statement.
4. **DataService** executes the SQL using DuckDB directly over the Pandas DataFrame.
5. **LLM Service** receives raw tabular/scalar results -> Generates natural language summary.
6. **API Gateway** returns `QueryResponse` (Polished text + Raw data table + SQL metadata) to the React Frontend.

---

## Security & Guardrails
* **RCE Prevention:** Executing arbitrary Python/Pandas code via `eval()` is strictly prohibited.
* **SQL Isolation:** DuckDB operates entirely in-memory and is restricted solely to `SELECT` operations. Schema-modifying commands or write operations are rejected at the execution block.
* **Hot-Reload Resilience:** Stateless processing errors (e.g., querying before an active file upload) are guarded using explicit `400 Bad Request` exceptions.