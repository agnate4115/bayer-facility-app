import os
import json
from openai import AzureOpenAI
from dotenv import load_dotenv

load_dotenv()

client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview"),
    azure_endpoint=os.getenv("AZURE_OPENAI_BASE_URL")
)
deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o")

def categorize_ticket_ai(description: str, categories: list[str]):
    """
    Calls Azure OpenAI to categorize a ticket, provide a summary, and assign priority.
    """
    categories_str = ", ".join(categories)
    
    system_prompt = """
You are a facility management AI assistant. Your job is to analyze a ticket description and provide:
1. The most appropriate category from the provided list.
2. A very short summary (3-5 words maximum).
3. A priority (P1, P2, P3) based on the severity.

Priority criteria:
- P1 (Critical): Severe safety hazards, total power/water failure affecting the whole floor, major leaks, extreme emergencies.
- P2 (High): Localized issues affecting multiple people (e.g., HVAC down in one zone, broken main door, spill in hallway).
- P3 (Low): Single-person or cosmetic issues (e.g., flickering light at one desk, squeaky chair, minor stain).

You MUST output your response strictly in JSON format with the following keys:
{
  "category": "<category_name>",
  "summary": "<summary>",
  "priority": "<P1|P2|P3>"
}
Do not include markdown blocks or any other text.
"""

    user_prompt = f"Categories available: {categories_str}\n\nTicket Description: {description}"

    try:
        response = client.chat.completions.create(
            model=deployment_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.0,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        result = json.loads(content)
        
        # Ensure category is valid
        matched_cat = result.get("category", "")
        if matched_cat not in categories:
            # Fallback to the first category if it hallucinates
            matched_cat = categories[0] if categories else ""
            
        return {
            "category": matched_cat,
            "summary": result.get("summary", ""),
            "priority": result.get("priority", "P3")
        }
    except Exception as e:
        print(f"AI Categorization Error: {str(e)}")
        # Safe fallback
        return {
            "category": categories[0] if categories else "",
            "summary": "Issue Reported",
            "priority": "P3"
        }
