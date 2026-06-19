from fastapi import APIRouter, File, UploadFile
from services.data_service import data_service
from models.schemas import UploadResponse, DataResponse

router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    return await data_service.load_csv(file)

@router.get("/rows", response_model=DataResponse)
def get_data(page: int = 1, page_size: int = 50):
    return data_service.get_data(page, page_size)

