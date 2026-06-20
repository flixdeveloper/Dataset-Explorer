from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class UploadResponse(BaseModel):
    filename: str
    rows_count: int


class DataResponse(BaseModel):
    columns: list[str]
    data: list[list[Any]]
    total_rows: int
    page: int = 1


# TODO: add columns and filters
#    columns: list[str] | None = None
#    filters: list[FilterCondition] | None = None



class CellReference(BaseModel):
    row_index: int
    column_name: str
    model_config = ConfigDict(frozen=True)

class ContextUsed(BaseModel):
    used_rows: list[int]= Field(default_factory=list)
    used_columns: list[str]= Field(default_factory=list)
    used_cells: list[CellReference]= Field(default_factory=list)

class QuestionResponse(BaseModel):
    answer: str
    context_used: ContextUsed




class AskRequest(BaseModel):
    question: str


class LLMResponse(BaseModel):
    sql_query: list[str]= Field(default_factory=list)
    response: str
    context_used: ContextUsed = Field(default_factory=ContextUsed)
    did_finish: bool



class SuggestionsResponse(BaseModel):
    questions: list[str]