import os
import json
import time
import logging
from typing import Dict, Any
from openai import OpenAI

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            logger.error("OPENAI_API_KEY environment variable not set.")
            raise ValueError("OPENAI_API_KEY is not set.")
        
        logger.info(f"OpenAI API key loaded: {self.api_key[:8]}...{self.api_key[-4:]} ({len(self.api_key)} chars)")
        self.client = OpenAI(api_key=self.api_key)
        # Use the working model
        self.model = os.getenv("OPENAI_MODEL", "gpt-4.1-nano")

    def analyze_partnership(self, scenario_data: Dict[str, Any]) -> Dict[str, Any]:
        start_time = time.time()
        try:
            logger.info(f"🤖 Starting REAL OpenAI analysis with model: {self.model}")
            prompt = self._build_analysis_prompt(scenario_data)
            logger.info(f"Prompt: {prompt[:200]}...")
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a luxury brand partnership analyst. Provide analysis in JSON format with the following structure: {\"brand_alignment_score\": 85, \"audience_overlap_percentage\": 70, \"roi_projection\": 150, \"risk_level\": \"Medium\", \"key_risks\": [\"Risk 1\", \"Risk 2\"], \"recommendations\": [\"Rec 1\", \"Rec 2\"], \"market_insights\": [\"Insight 1\", \"Insight 2\"]}"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            analysis_duration = time.time() - start_time
            logger.info(f"✅ REAL OpenAI response received in {analysis_duration:.2f}s")
            
            response_content = response.choices[0].message.content
            logger.info(f"Raw OpenAI response: {response_content[:200]}...")
            
            analysis_result = self._parse_analysis_response(response_content)
            
            return {
                "status": "success",
                "analysis": analysis_result,
                "tokens_used": response.usage.total_tokens,
                "analysis_duration": analysis_duration
            }
        except Exception as e:
            logger.error(f"❌ OpenAI analysis failed: {str(e)}")
            return {"status": "error", "error": str(e)}

    def _build_analysis_prompt(self, scenario_data: Dict[str, Any]) -> str:
        return f"""Analyze this luxury brand partnership scenario:

**Partnership Details:**
- Brand A: {scenario_data.get("brand_a")}
- Brand B: {scenario_data.get("brand_b")}
- Partnership Type: {scenario_data.get("partnership_type")}
- Target Audience: {scenario_data.get("target_audience", "Not specified")}
- Budget Range: {scenario_data.get("budget_range", "Not specified")}

Please provide a comprehensive analysis including:
1. Brand alignment score (0-100)
2. Audience overlap percentage (0-100)
3. ROI projection percentage
4. Risk level (Low/Medium/High)
5. Key risks
6. Recommendations
7. Market insights

Respond in JSON format only."""

    def _parse_analysis_response(self, response_text: str) -> Dict[str, Any]:
        try:
            # Try to extract JSON from the response
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                return json.loads(json_str)
            else:
                # If no JSON found, return a structured fallback
                return {
                    "brand_alignment_score": 75,
                    "audience_overlap_percentage": 60,
                    "roi_projection": 120,
                    "risk_level": "Medium",
                    "key_risks": ["Market volatility", "Brand reputation risk"],
                    "recommendations": ["Conduct market research", "Develop clear brand guidelines"],
                    "market_insights": ["Strong potential in luxury segment", "Growing demand for collaborations"],
                    "raw_response": response_text
                }
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from OpenAI response: {e}")
            logger.error(f"Raw response: {response_text}")
            return {
                "error": "Invalid JSON response from AI",
                "raw_response": response_text,
                "brand_alignment_score": 70,
                "audience_overlap_percentage": 50,
                "roi_projection": 100,
                "risk_level": "Medium",
                "key_risks": ["Analysis parsing error"],
                "recommendations": ["Retry analysis"],
                "market_insights": ["Unable to parse AI response"]
            }
