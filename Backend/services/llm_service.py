import json
from google import genai
from google.genai import types
from core.config import settings
from models.schemas import ContextUsed, LLMResponse, QuestionResponse, SuggestionsResponse
from fastapi import HTTPException
from services.data_service import data_service
from core.prompts import AGENT_PROMPT, SUGGESTIONS_PROMPT

class LLMService:
    def __init__(self):
        self.MAX_TURNS = 3
        self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)

    async def ask_question(self, question: str) -> QuestionResponse:
        try:
            context = data_service.get_llm_context()
        except HTTPException as e:
            raise e

        agent_memory = f"""
        <task>
        {question}
        </task>

        <schema>
        {context}
        </schema>

        <history>
        No queries have been executed yet. This is Turn 1 of {self.MAX_TURNS} at most.
    """

        used_rows=set()
        used_columns=set()
        used_cells=set()

        for turn in range(self.MAX_TURNS):
            try:
                prompt = f"""
                {agent_memory}
                </history>
                <reminder>Follow the constraints and output ONLY valid JSON.</reminder>
                """
                llm_response = await self.run_agent_step(prompt)
            except Exception as e:
                raise HTTPException(status_code=503, detail=f"LLM Error during turn {turn}: {str(e)}")

            used_rows.update(llm_response.context_used.used_rows)
            used_columns.update(llm_response.context_used.used_columns)
            used_cells.update(llm_response.context_used.used_cells)

            if llm_response.did_finish:
                return QuestionResponse(
                    answer=llm_response.response,
                    context_used=ContextUsed(
                        used_rows=list(used_rows),
                        used_columns=list(used_columns),
                        used_cells=list(used_cells),
                    ),
                )

            sql_execution_feedback = ""
            if llm_response.sql_query:
                for query in llm_response.sql_query:
                    try:
                        query_result = data_service.run_sql_query(query)
                        sql_execution_feedback += f"""
                        <query sql="{query}">
                            <status>success</status>
                            <rows_returned>{len(query_result)}</rows_returned>
                            <data>
                            {query_result.to_dict(orient="records")}
                            </data>
                        </query>"""
                    except HTTPException as sql_error:
                        sql_execution_feedback += f"""
                        <query sql="{query}">
                            <status>error</status>
                            <error_message>{sql_error.detail}</error_message>
                        </query>"""
            else:
                raise HTTPException(status_code=500, detail="An unexpected issue while analyzing the data. Please try again or refine your question.")

            
            agent_memory += f"""
        <turn index="{turn}">
            <agent_reasoning>
            {llm_response.response}
            </agent_reasoning>
            <sql_results>
            {sql_execution_feedback}
            </sql_results>
        </turn>
        """
        return QuestionResponse(
            answer="I reached the maximum number of queries without a final conclusion. Based on the data examined so far, I cannot provide a definitive answer. Please refine or narrow down your question.",
            context_used=ContextUsed(
                used_rows=list(used_rows),
                used_columns=list(used_columns),
                used_cells=list(used_cells),
            ),
        )

    async def run_agent_step(self, prompt: str) -> LLMResponse:
        try:
            response = await self.client.aio.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=AGENT_PROMPT,
                    response_mime_type="application/json",
                    response_schema=LLMResponse,
                    temperature=0.1
                ),
            )
            return LLMResponse.model_validate_json(response.text)

        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500, 
                detail="LLM returned an invalid JSON string format."
            )
        except Exception as e:
            raise HTTPException(
                status_code=503, 
                detail=f"Gemini API connection failure: {str(e)}"
            )

    async def generate_suggestions(self) -> SuggestionsResponse:
        try:
            context = data_service.get_llm_context()
        except HTTPException as e:
            raise e

        try:
            response = await self.client.aio.models.generate_content(
                model='gemini-2.5-flash',
                contents=f"<context>\n{context}\n</context>",
                config=types.GenerateContentConfig(
                    system_instruction=SUGGESTIONS_PROMPT,
                    response_mime_type="application/json",
                    response_schema=SuggestionsResponse,
                    temperature=0.7,
                ),
            )
            return SuggestionsResponse.model_validate_json(response.text)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="LLM returned an invalid JSON string format.")
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Gemini API connection failure: {str(e)}")

llm_service = LLMService()