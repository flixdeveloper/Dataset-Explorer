from typing import Any, Literal

from pydantic import BaseModel


class UploadResponse(BaseModel):
    status: str
    filename: str
    rows_count: int
    columns: list[str]


class DataResponse(BaseModel):
    data: list[dict[str, Any]]
    total_rows: int
    page: int


class FilterCondition(BaseModel):
    column: str
    operator: Literal["==", "!=", ">", ">=", "<", "<="]
    value: Any

class QueryRequest(BaseModel):
    question: str
    selected_columns: list[str] = []
    filters: list[FilterCondition] = []


class CellReference(BaseModel):
    row_index: int
    column_name: str

class ContextUsed(BaseModel):
    used_rows: list[int] = []
    used_columns: list[str] = []
    used_cells: list[CellReference] = []

class QueryResponse(BaseModel):
    answer: str
    context_used: ContextUsed
