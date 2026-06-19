import pandas as pd
import google.generativeai as genai
from core.config import settings
from models.schemas import QueryRequest, QueryResponse
from pydantic import ValidationError
from fastapi import HTTPException

class LLMService:
    def __init__(self):
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    async def ask_question(self, request: QueryRequest, df: pd.DataFrame) -> QueryResponse:
        question = request.question
        context = self._get_context(request, df)
        prompt = self._generate_prompt(question, context)

        try:
            response = await self.model.generate_content_async(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    response_schema=QueryResponse,
                ),
            )
            
            return QueryResponse.model_validate_json(response.text)

        except ValidationError as e:
            raise HTTPException(status_code=500, detail=f"LLM Response formatting error: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"LLM Service unavailable: {str(e)}")

    def _generate_prompt(self, question: str, df_context: str) -> str:
        return f"""
        You are an expert Data Analyst AI. Your core task is to analyze the provided dataset context and answer the user's query accurately based ONLY on the given data.

        CRITICAL RULES FOR CONTEXT TRACKING:
        - Transparency is mandatory. You must report the exact data points (rows, columns, cells) you utilized.
        - `used_columns`: Must contain the exact string names of the columns you analyzed to answer the query.
        - `used_rows`: Must contain the original integer indices explicitly provided in the data snippet. Do not invent or sequence indices.
        - `used_cells`: Must contain the specific critical intersections (row + column) that directly prove your answer.
        - If a query is general (e.g., "What columns exist in this table?"), leave `used_rows` and `used_cells` empty.

        BEHAVIOR & EDGE CASES:
        - Language: You MUST write the "answer" field in the exact same language as the User Query (e.g., if asked in Hebrew, reply in Hebrew).
        - Out of Scope / Malicious: If the query is entirely unrelated to the dataset (e.g., general trivia, coding requests, writing poems), politely decline in the "answer" field stating you can only answer questions related to the uploaded dataset, and leave all tracking fields empty.
        - Insufficient Data: If the snippet doesn't contain enough information to fully answer the question, provide a partial answer based on what is available and note the limitation.

        --- DATASET CONTEXT ---
        {df_context}
        
        --- USER QUERY ---
        {question}
        """

    def _get_context(self, request: QueryRequest, df: pd.DataFrame) -> str:
        # Column selection: use provided list, if not provided, use all columns
        columns = request.selected_columns if request.selected_columns else df.columns.tolist()
        df = df[columns]

        # Row filtering: apply each filter condition in sequence
        if request.filters:
            ops = {
                "==": lambda col, val: df[col] == val,
                "!=": lambda col, val: df[col] != val,
                ">":  lambda col, val: df[col] > val,
                ">=": lambda col, val: df[col] >= val,
                "<":  lambda col, val: df[col] < val,
                "<=": lambda col, val: df[col] <= val,
            }
            for f in request.filters:
                if f.column in df.columns:
                    df = df[ops[f.operator](f.column, f.value)]

        return df.to_string(index=True)
llm_service = LLMService()