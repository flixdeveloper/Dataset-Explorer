import re
from contextlib import contextmanager

from fastapi import HTTPException
from mcp.server.fastmcp import FastMCP

from services.data_service import data_service
from services.llm_service import llm_service

mcp = FastMCP("dataset-explorer")


@contextmanager
def _safe_execution():
    """
    Translate FastAPI HTTPExceptions raised by the services into plain errors.
    """
    try:
        yield
    except HTTPException as e:
        raise RuntimeError(e.detail) from e

_ALLOWED_STARTS_KEYWORDS = ("SELECT", "WITH", "EXPLAIN", "DESCRIBE", "SHOW", "VALUES", "FROM", "SUMMARIZE", "PIVOT", "UNPIVOT")

_BLOCKED_KEYWORDS = {
    "DROP", "DELETE", "UPDATE", "INSERT",
    "ALTER", "CREATE", "TRUNCATE", "EXEC", "CALL", "COPY", "PRAGMA"
}

@mcp.tool()
def get_dataset_schema() -> str:
    """Return the schema of the loaded dataset."""
    with _safe_execution():
        return data_service.get_llm_context()


@mcp.tool()
def run_sql_query(query: str) -> list[dict]:
    """
    Execute a read-only query against the loaded dataset via DuckDB (table name: df).

    Raises ValueError for any query that does not start with an allowed read
    keyword or that contains a write/DDL keyword.
    """
    # Normalize: trim whitespace and drop a single trailing semicolon before validating.
    cleaned = query.strip()
    if cleaned.endswith(";"):
        cleaned = cleaned[:-1].strip()

    upper = cleaned.upper()

    # Block stacked statements: any remaining semicolon means more than one statement.
    if ";" in cleaned:
        raise ValueError(
            "Blocked: Multiple statements are not allowed. Please remove semicolons (;)."
        )

    # The query must begin with a read-only keyword.
    if not upper.startswith(_ALLOWED_STARTS_KEYWORDS):
        allowed = ", ".join(_ALLOWED_STARTS_KEYWORDS)
        raise ValueError(
            f"Blocked: query must start with one of: {allowed}."
        )

    # Reject any query that contains a write or DDL keyword as a standalone word.
    for kw in _BLOCKED_KEYWORDS:
        if re.search(rf"\b{kw}\b", upper):
            raise ValueError(
                f"Blocked: forbidden keyword '{kw}' found in query."
            )
    
    with _safe_execution():
        return data_service.run_sql_query(cleaned).to_dict(orient="records")


@mcp.tool()
def get_rows(page: int, page_size: int):
    """Return a paginated slice of the loaded dataset (page is 1-indexed)."""
    with _safe_execution():
        return data_service.get_data(page, page_size)


@mcp.tool()
async def ask_dataset(question: str) -> str:
    """Answer a natural-language question about the dataset using the ReAct agent."""
    with _safe_execution():
        result = await llm_service.ask_question(question)
    return result.answer
