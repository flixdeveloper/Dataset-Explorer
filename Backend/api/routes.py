from fastapi import APIRouter, File, UploadFile
from services.llm_service import llm_service
from services.data_service import data_service
from models.schemas import QueryRequest, QueryResponse, UploadResponse, DataResponse

router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    return await data_service.load_csv(file)

@router.get("/rows", response_model=DataResponse)
def get_data(page: int = 1, page_size: int = 50):
    return data_service.get_data(page, page_size)

@router.post("/ask", response_model=QueryResponse)
async def ask_question(request: QueryRequest):
    data = data_service.get_df()
    return await llm_service.ask_question(request, data)
