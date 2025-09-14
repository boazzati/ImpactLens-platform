import os
import json
import time
from typing import Dict, Any, Optional
from openai import OpenAI
import logging

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.model = os.getenv('OPENAI_MODEL', 'gpt-4')
    
    async def analyze_partnership(self, scenario_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze partnership scenario using OpenAI GPT
        """
        start_time = time.time()
        
        try:
            # Construct analysis prompt
            prompt = self._build_analysis_prompt(scenario_data)
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system", 
                        "content": """You are an expert luxury brand partnership analyst with deep knowledge of:
                        - Luxury market dynamics and consumer behavior
                        - Brand positioning and alignment strategies
                        - Partnership ROI calculation and risk assessment
                        - Audience segmentation and overlap analysis
                        
                        Provide detailed, actionable insights for luxury brand partnerships."""
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            analysis_duration = time.time() - start_time
            
            # Parse and structure response
            analysis_result = self._parse_analysis_response(
                response.choices[0].message.content
            )
            
            return {
                "status": "success",
                "analysis": analysis_result,
                "tokens_used": response.usage.total_tokens,
                "analysis_duration": analysis_duration
            }
            
        except Exception as e:
            logger.error(f"OpenAI analysis failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "analysis_duration": time.time() - start_time
            }
    
    def _build_analysis_prompt(self, scenario_data: Dict[str, Any]) -> str:
        """Build structured prompt for partnership analysis"""
        return f"""
        Analyze this luxury brand partnership scenario and provide detailed insights:
        
        **Partnership Details:**
        - Brand A: {scenario_data.get('brand_a', 'Unknown')}
        - Brand B: {scenario_data.get('brand_b', 'Unknown')}
        - Partnership Type: {scenario_data.get('partnership_type', 'Unknown')}
        - Target Audience: {scenario_data.get('target_audience', 'Unknown')}
        - Budget Range: {scenario_data.get('budget_range', 'Unknown')}
        
        Please provide your analysis in the following JSON format:
        {{
            "brand_alignment_score": <float between 1-10>,
            "audience_overlap_percentage": <float between 0-100>,
            "roi_projection": <float representing percentage ROI>,
            "risk_level": "<low|medium|high>",
            "key_risks": [
                "Risk factor 1",
                "Risk factor 2",
                "Risk factor 3"
            ],
            "recommendations": [
                "Recommendation 1",
                "Recommendation 2", 
                "Recommendation 3"
            ],
            "market_insights": {{
                "brand_synergy": "Analysis of how well the brands complement each other",
                "audience_analysis": "Detailed audience overlap and expansion opportunities",
                "competitive_landscape": "Market positioning and competitive advantages",
                "execution_strategy": "Recommended approach for partnership execution"
            }}
        }}
        
        Focus on luxury market dynamics, brand prestige considerations, and high-net-worth consumer behavior.
        """
    
    def _parse_analysis_response(self, response_text: str) -> Dict[str, Any]:
        """Parse and validate OpenAI response"""
        try:
            # Extract JSON from response if wrapped in text
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx == -1 or end_idx == 0:
                raise ValueError("No JSON found in response")
            
            json_str = response_text[start_idx:end_idx]
            parsed_data = json.loads(json_str)
            
            # Validate required fields and provide defaults
            return {
                "brand_alignment_score": float(parsed_data.get("brand_alignment_score", 5.0)),
                "audience_overlap_percentage": float(parsed_data.get("audience_overlap_percentage", 50.0)),
                "roi_projection": float(parsed_data.get("roi_projection", 100.0)),
                "risk_level": parsed_data.get("risk_level", "medium").lower(),
                "key_risks": parsed_data.get("key_risks", ["Analysis parsing incomplete"]),
                "recommendations": parsed_data.get("recommendations", ["Please retry analysis"]),
                "market_insights": parsed_data.get("market_insights", {
                    "brand_synergy": "Analysis incomplete",
                    "audience_analysis": "Analysis incomplete", 
                    "competitive_landscape": "Analysis incomplete",
                    "execution_strategy": "Analysis incomplete"
                })
            }
            
        except (json.JSONDecodeError, ValueError, KeyError) as e:
            logger.error(f"Failed to parse OpenAI response: {str(e)}")
            # Fallback to structured parsing if JSON fails
            return {
                "brand_alignment_score": 5.0,
                "audience_overlap_percentage": 50.0,
                "roi_projection": 100.0,
                "risk_level": "medium",
                "key_risks": ["Analysis parsing failed - please retry"],
                "recommendations": ["Please retry analysis with more specific details"],
                "market_insights": {
                    "brand_synergy": "Unable to analyze - parsing error",
                    "audience_analysis": "Unable to analyze - parsing error",
                    "competitive_landscape": "Unable to analyze - parsing error", 
                    "execution_strategy": "Unable to analyze - parsing error"
                }
            }
    
    def get_partnership_suggestions(self, brand_name: str, industry: str = None) -> Dict[str, Any]:
        """
        Get AI-powered partnership suggestions for a given brand
        """
        try:
            prompt = f"""
            Suggest 5 potential luxury brand partnership opportunities for {brand_name}.
            {f"Focus on the {industry} industry." if industry else ""}
            
            For each suggestion, provide:
            - Partner brand name
            - Partnership type (co-branding, sponsorship, collaboration, etc.)
            - Rationale (why this partnership makes sense)
            - Estimated brand alignment score (1-10)
            
            Format as JSON array.
            """
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a luxury brand partnership strategist."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            return {
                "status": "success",
                "suggestions": response.choices[0].message.content,
                "tokens_used": response.usage.total_tokens
            }
            
        except Exception as e:
            logger.error(f"Partnership suggestions failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
