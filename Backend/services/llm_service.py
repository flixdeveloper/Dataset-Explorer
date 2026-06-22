import logging

from google import genai
from google.genai import types
from anthropic import AsyncAnthropic
from pydantic import ValidationError
from core.config import settings
from models.schemas import LLMResponse, QuestionResponse, SuggestionsResponse
from fastapi import HTTPException
from services.data_service import data_service
from core.prompts import AGENT_PROMPT, SUGGESTIONS_PROMPT

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.MAX_TURNS = 3
        self.google_client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        self.anthropic_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def ask_question(self, question: str) -> QuestionResponse:
        context = data_service.get_llm_context()

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

        #TODO: save queries

        for turn in range(self.MAX_TURNS):
            try:
                prompt = f"""
                    {agent_memory}
                    </history>
                    """
                llm_response = await self.run_agent_step(prompt)
            except Exception as e:
                raise HTTPException(status_code=503, detail=f"LLM Error during turn {turn}: {str(e)}")

            if llm_response.did_finish:
                return QuestionResponse(
                    answer=llm_response.response,
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
        )

    async def run_agent_step(self, prompt: str) -> LLMResponse:
        try:
            logger.debug(
                "=== LLM REQUEST (run_agent_step / Claude) ===\n"
                "[SYSTEM INSTRUCTION]\n%s\n"
                "[USER MESSAGE]\n%s",
                AGENT_PROMPT, prompt,
            )
            response = await self.anthropic_client.messages.create(
                model="claude-sonnet-4-6",
                system=AGENT_PROMPT,
                max_tokens=4096,
                temperature=0.1,
                messages=[{"role": "user", "content": prompt}],
                tool_choice={"type": "tool", "name": "pydantic_schema"},
                tools=[
                    {
                        "name": "pydantic_schema",
                        "description": "The JSON schema for the response.",
                        "input_schema": LLMResponse.model_json_schema(),
                    }
                ],
            )
            logger.debug(
                "=== LLM RESPONSE (run_agent_step / Claude) ===\n%s",
                response.model_dump_json(indent=2),
            )

            tool_call = next((block for block in response.content if block.type == 'tool_use'), None)
            if not tool_call:
                raise HTTPException(status_code=500, detail="LLM did not return a valid tool call.")

            return LLMResponse.model_validate(tool_call.input)

        except ValidationError:
            raise HTTPException(
                status_code=500,
                detail="LLM returned an invalid JSON string format."
            )
        except Exception as e:
            raise HTTPException(
                status_code=503,
                detail=f"Anthropic API connection failure: {str(e)}"
            )

    async def generate_suggestions(self) -> SuggestionsResponse:
        context = data_service.get_llm_context()
        contents = f"<context>\n{context}\n</context>"
        logger.debug(
            "=== LLM REQUEST (generate_suggestions) ===\n"
            "[SYSTEM INSTRUCTION]\n%s\n"
            "[CONTENTS]\n%s",
            SUGGESTIONS_PROMPT, contents
        )
        
        try:
            response = await self.google_client.aio.models.generate_content(
                model='gemini-2.5-flash-lite',
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=SUGGESTIONS_PROMPT,
                    response_mime_type="application/json",
                    response_schema=SuggestionsResponse,
                    temperature=0.7,
                ),
            )
            return SuggestionsResponse.model_validate_json(response.text)
        except ValidationError:
            raise HTTPException(status_code=500, detail="LLM returned an invalid JSON string format.")
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Gemini API connection failure: {str(e)}")

llm_service = LLMService()