import io

import pandas as pd
from fastapi import HTTPException, UploadFile
from models.schemas import DataResponse, UploadResponse

class DataService:
    def __init__(self):
        self.df: pd.DataFrame | None = None
        self.filename: str | None = None

    async def load_csv(self, file: UploadFile) -> UploadResponse:
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

        self.filename = file.filename
        rows_count = len(self.df)

        return UploadResponse(
            filename=self.filename,
            rows_count=rows_count,
        )

    def get_df(self) -> pd.DataFrame:
        if self.df is None:
            raise HTTPException(status_code=400, detail="Error loading data.")
        return self.df


    def get_data(self, page: int = 1, page_size: int = 50) -> DataResponse:
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


data_service = DataService()
