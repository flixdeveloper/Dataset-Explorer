from typing import Any, Literal

from pydantic import BaseModel, ConfigDict


class UploadResponse(BaseModel):
    filename: str
    rows_count: int


class DataResponse(BaseModel):
    columns: list[str]
    data: list[list[Any]]
    total_rows: int
    page: int = 1


class FilterCondition(BaseModel):
    column: str
    operator: Literal["==", "!=", ">", ">=", "<", "<="]
    value: Any


# TODO: add columns and filters
#    columns: list[str] | None = None
#    filters: list[FilterCondition] | None = None


class LLMResponse(BaseModel):
    sql_query: list[str]
    response: str
    context_used: ContextUsed
    did_finish: bool





class CellReference(BaseModel):
    row_index: int
    column_name: str
    model_config = ConfigDict(frozen=True)

class ContextUsed(BaseModel):
    used_rows: list[int]
    used_columns: list[str]
    used_cells: list[CellReference]

class QuestionResponse(BaseModel):
    answer: str
    context_used: ContextUsed
