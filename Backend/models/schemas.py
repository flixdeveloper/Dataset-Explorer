from typing import Any, Literal

from pydantic import BaseModel


class UploadResponse(BaseModel):
    filename: str
    rows_count: int


class DataResponse(BaseModel):
    columns: list[str]
    data: list[list[Any]]
    total_rows: int
    page: int


class FilterCondition(BaseModel):
    column: str
    operator: Literal["==", "!=", ">", ">=", "<", "<="]
    value: Any

class QueryRequest(BaseModel):
    question: str
    selected_columns: list[str] | None = None
    filters: list[FilterCondition] | None = None


class CellReference(BaseModel):
    row_index: int
    column_name: str

class ContextUsed(BaseModel):
    used_rows: list[int]
    used_columns: list[str]
    used_cells: list[CellReference]

class QueryResponse(BaseModel):
    answer: str
    context_used: ContextUsed
