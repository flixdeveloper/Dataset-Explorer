from typing import Any

from pydantic import BaseModel, Field


class UploadResponse(BaseModel):
    filename: str
    rows_count: int


class DataResponse(BaseModel):
    columns: list[str]
    data: list[list[Any]]
    total_rows: int
    page: int = 1


# TODO: add columns filters
#    columns: list[str] | None = None


class QuestionResponse(BaseModel):
    answer: str


class AskRequest(BaseModel):
    question: str


class LLMResponse(BaseModel):
    sql_query: list[str] = Field(default_factory=list)
    response: str
    did_finish: bool


class SuggestionsResponse(BaseModel):
    questions: list[str]