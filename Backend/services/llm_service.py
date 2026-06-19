import json
from google import genai
from google.genai import types
from core.config import settings
from models.schemas import ContextUsed, LLMResponse, QuestionResponse
from fastapi import HTTPException
from services.data_service import data_service


class LLMService:
    def __init__(self):
        self.MAX_TURNS = 3
        self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        #self.model = genai.GenerativeModel('gemini-2.5-flash')

    async def ask_question(self, question: str) -> QuestionResponse:
        try:
            context = data_service.get_llm_context()
        except HTTPException as e:
            raise e

        agent_memory = f"""
    Initial Task: "{question}"
    Available Table Schema:
    {context}
    
    Execution History:
    """

        used_rows=set()
        used_columns=set()
        used_cells=set()

        current_turn = 1

        while current_turn <= self.MAX_TURNS:
            try:
                llm_response = await self.run_agent_step(agent_memory)
            except Exception as e:
                raise HTTPException(status_code=503, detail=f"LLM Error during turn {current_turn}: {str(e)}")

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
                        sql_execution_feedback += f"\n- Query: {query}\n  Result: {query_result.to_string(index=True)}"
                    except HTTPException as sql_error:
                        sql_execution_feedback += f"\n- Query: {query}\n  Execution Error: {sql_error.detail}"
            else:
                sql_execution_feedback = "\nNo SQL queries were executed in this turn."
                #TODO consider as error

            agent_memory += f"""
        --- Turn {current_turn} ---
        Your previous thought/response: "{llm_response.response}"
        Attempted SQL Queries: {llm_response.sql_query}
        Database Execution Feedback: {sql_execution_feedback}
        ------------------------
        """

            current_turn += 1

        return QuestionResponse(
            answer="I completed the maximum analysis cycles but could not formulate a definitive answer. Please refine your question.",
            context_used=ContextUsed(
                used_rows=list(used_rows),
                used_columns=list(used_columns),
                used_cells=list(used_cells),
            ),
        )

    async def run_agent_step(self, agent_memory: str) -> LLMResponse:
        system_instruction = """
        <role>
        You are a precision Data Science Agent running inside a multi-turn ReAct loop.
        Your ONLY goal: answer the user's initial query with 100% mathematical accuracy using a local DuckDB table named `df`.
        </role>

        <laws>
        LAW 1 — TOKEN GUARD (MUST NOT violate):
        - NEVER emit SELECT * FROM df without a WHERE clause that limits results to under 200 rows OR an explicit LIMIT ≤ 200.
        - Violation = system crash. No exceptions.

        LAW 2 — SQL SAFETY:
        - ONLY SELECT statements are permitted.
        - DROP, DELETE, INSERT, UPDATE, ALTER, CREATE are strictly forbidden.
        - Write clean DuckDB-compatible syntax only. No markdown code fences around queries.

        LAW 3 — TWO-STEP PROTOCOL:
        - Turn 1 (did_finish = false): Write a targeted SQL query that retrieves only the minimal rows/columns needed. State your reasoning in the `response` field.
        - Turn 2 (did_finish = true): Inspect the rows returned in memory, execute step-by-step logic, and write the final conclusive answer.
        - NEVER skip to did_finish = true without first having the data in memory.

        LAW 4 — CONTEXT TRACKING (context_used):
        - `used_columns`: ALWAYS list every column name referenced in SQL or reasoning.
        - `used_rows` & `used_cells`: ONLY populate when you are directly inspecting individual row results returned by the database in your memory.
        - For aggregate SQL (AVG, COUNT, SUM, MAX, MIN applied in the query itself): set `used_rows` and `used_cells` to []. You do not see the individual rows that built the aggregate.

        LAW 5 — ERROR RECOVERY:
        - If a previous SQL query returned an error or empty results: do NOT repeat the same query. Adjust the logic, explain the change in `response`, and issue a corrected query.
        - If you cannot resolve an error in 2 attempts: set did_finish = true and report the blocker explicitly.
        </laws>

        <checkpoint_protocol>
        Use the `response` field to log your current state using this exact format:
        - When did_finish = false: "Completed: [what was done this step] | Next: [what the next query will do]"
        - When did_finish = true: Write ONLY the final answer. No checkpoint prefix. No "Completed:" label.
        </checkpoint_protocol>

        <task>
        Review the memory above and make a binary decision:

        CASE A — Data is sufficient: set did_finish = true. Write ONLY the final answer in `response`. No checkpoint prefix.
        CASE B — Data is missing, query failed, or aggregation needed: set did_finish = false. Write the corrected or new SQL in `sql_query`. Log progress in `response` using the checkpoint format above.

        Output ONLY valid JSON. No preamble. No markdown.
        </task>
        """

        prompt = f"""
        <memory>
        {agent_memory}
        </memory>
        """

        try:
            response = await self.client.aio.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
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

llm_service = LLMService()