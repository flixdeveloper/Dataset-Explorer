import io

import pandas as pd
from fastapi import HTTPException, UploadFile
from models.schemas import DataResponse, UploadResponse
import duckdb

class DataService:
    def __init__(self):
        self.df: pd.DataFrame | None = None
        self.filename: str | None = None

    async def load_csv(self, file: UploadFile) -> UploadResponse:
        """
        Parse an uploaded CSV into the in-memory dataset.

        Tries UTF-8 first, then Windows-1255 for Hebrew files. Adds
        __sys_agent_row_id__ so the agent can reference stable row indices in SQL.
        """
        if file.content_type != "text/csv":
            raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV.")

        contents = await file.read()

        if not contents:
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")

        try:
            self.df = pd.read_csv(io.BytesIO(contents), encoding="utf-8")
        except UnicodeDecodeError:
            try:
                self.df = pd.read_csv(io.BytesIO(contents), encoding="windows-1255")
            except Exception:
                raise HTTPException(
                    status_code=400,
                    detail="File encoding is not supported. Please save as UTF-8.",
                )
        except pd.errors.EmptyDataError:
            raise HTTPException(status_code=400, detail="The CSV file is empty.")
        except pd.errors.ParserError:
            raise HTTPException(
                status_code=400,
                detail="The CSV file is corrupted.",
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An unexpected server error occurred: {str(e)}",
            )
        
        self.df.reset_index(names='__sys_agent_row_id__', inplace=True)
        self.filename = file.filename
        rows_count = len(self.df)

        return UploadResponse(
            filename=self.filename,
            rows_count=rows_count,
        )


    def get_data(self, page: int = 1, page_size: int = 50) -> DataResponse:
        """
        Return one page of rows for the frontend table.

        Slices the in-memory DataFrame server-side and replaces NaN with None
        so the JSON response serializes without errors.
        """
        if self.df is None:
            raise HTTPException(status_code=400, detail="Error loading data.")
        if page < 1 or page_size < 1:
            raise HTTPException(status_code=400, detail="Page and size must be positive.")

        total_rows = len(self.df)

        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        page_slice = self.df.iloc[start_idx:end_idx]
        cleaned = page_slice.where(pd.notna(page_slice), None)
        split_dict = cleaned.to_dict(orient="split")

        return DataResponse(
            columns=split_dict["columns"],
            data=split_dict["data"],
            total_rows=total_rows,
            page=page,
        )

    def get_llm_context(self) -> str:
        if self.df is None:
            raise HTTPException(status_code=400, detail="Error loading data.")
        
        total_rows = len(self.df)
        dtypes_info = self.df.dtypes.astype(str).to_dict()
        columns = [f"- {col} ({dtype})" for col, dtype in dtypes_info.items()]
        context = f"Table name: {self.filename}\nTotal rows: {total_rows}\nColumns: \n{'\n'.join(columns)}"
        return context

    def run_sql_query(self, query: str) -> pd.DataFrame:
        """
        Execute agent-generated SQL against the loaded dataset via DuckDB.

        Registers the in-memory DataFrame as table `df`. Errors are surfaced
        to the agent loop as feedback, not as unhandled server crashes.
        """
        if self.df is None:
            raise HTTPException(status_code=400, detail="Error loading data.")
        try:
            con = duckdb.connect()
            con.register("df", self.df)
            return con.execute(query).df()
        except duckdb.Error as e:
            raise HTTPException(status_code=400, detail=f"SQL error: {str(e)}")

data_service = DataService()
