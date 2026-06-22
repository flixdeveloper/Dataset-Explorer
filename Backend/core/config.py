from dotenv import find_dotenv, load_dotenv
from pydantic_settings import BaseSettings

load_dotenv(find_dotenv())


class Settings(BaseSettings):
    GOOGLE_API_KEY: str
    ANTHROPIC_API_KEY: str
    FRONTEND_URL: str = "http://localhost:5173"


settings = Settings()