import time
import logging
import random
from typing import Dict, Any

logger = logging.getLogger(__name__)

class MockOpenAIService:
    """Mock OpenAI service for testing and development"""
    
    def __init__(self):
        logger.info("Using Mock OpenAI Service for testing")
        self.model = "mock-gpt-4"

    def analyze_partnership(self, scenario_data: Dict[str, Any]) -> Dict[str, Any]:
        start_time = time.time()
        
        # Simulate API delay
        time.sleep(random.uniform(1, 3))
        
        try:
            brand_a = scenario_data.get("brand_a", "Brand A")
            brand_b = scenario_data.get("brand_b", "Brand B")
            partnership_type = scenario_data.get("partnership_type", "Collaboration")
            
            # Generate realistic mock data based on the brands
            analysis_result = self._generate_mock_analysis(brand_a, brand_b, partnership_type)
            
            analysis_duration = time.time() - start_time
            
            return {
                "status": "success",
                "analysis": analysis_result,
                "tokens_used": random.randint(800, 1200),
                "analysis_duration": analysis_duration
            }
        except Exception as e:
            logger.error(f"Mock OpenAI analysis failed: {str(e)}")
            return {"status": "error", "error": str(e)}

    def _generate_mock_analysis(self, brand_a: str, brand_b: str, partnership_type: str) -> Dict[str, Any]:
        """Generate realistic mock analysis data"""
        
        # Brand alignment score based on brand compatibility
        luxury_brands = ["louis vuitton", "gucci", "chanel", "hermès", "prada", "dior"]
        streetwear_brands = ["supreme", "off-white", "bape", "kith", "fear of god"]
        
        brand_a_lower = brand_a.lower()
        brand_b_lower = brand_b.lower()
        
        # Calculate alignment score
        if (brand_a_lower in luxury_brands and brand_b_lower in streetwear_brands) or \
           (brand_a_lower in streetwear_brands and brand_b_lower in luxury_brands):
            alignment_score = random.randint(75, 90)  # High alignment for luxury x streetwear
        elif brand_a_lower in luxury_brands and brand_b_lower in luxury_brands:
            alignment_score = random.randint(60, 80)  # Medium alignment for luxury x luxury
        else:
            alignment_score = random.randint(50, 75)  # Variable alignment for other combinations
        
        # Generate other metrics
        audience_overlap = random.randint(40, 80)
        roi_projection = random.randint(110, 200)
        
        risk_levels = ["Low", "Medium", "High"]
        risk_level = random.choice(risk_levels)
        
        # Generate contextual risks and recommendations
        key_risks = self._generate_risks(brand_a, brand_b, partnership_type)
        recommendations = self._generate_recommendations(brand_a, brand_b, partnership_type)
        market_insights = self._generate_insights(brand_a, brand_b, partnership_type)
        
        return {
            "brand_alignment_score": alignment_score,
            "audience_overlap_percentage": audience_overlap,
            "roi_projection": roi_projection,
            "risk_level": risk_level,
            "key_risks": key_risks,
            "recommendations": recommendations,
            "market_insights": market_insights
        }

    def _generate_risks(self, brand_a: str, brand_b: str, partnership_type: str) -> list:
        """Generate contextual risks based on the partnership"""
        base_risks = [
            "Brand dilution concerns",
            "Market reception uncertainty",
            "Production complexity",
            "Pricing strategy conflicts"
        ]
        
        if "luxury" in (brand_a + brand_b).lower():
            base_risks.extend([
                "Exclusivity perception risk",
                "Heritage brand protection"
            ])
        
        if "streetwear" in (brand_a + brand_b).lower():
            base_risks.extend([
                "Authenticity concerns",
                "Hype cycle dependency"
            ])
        
        return random.sample(base_risks, min(4, len(base_risks)))

    def _generate_recommendations(self, brand_a: str, brand_b: str, partnership_type: str) -> list:
        """Generate contextual recommendations"""
        base_recommendations = [
            "Conduct comprehensive market research",
            "Develop clear brand guidelines",
            "Create limited edition collections",
            "Implement strategic marketing campaign"
        ]
        
        if partnership_type.lower() == "co-branding":
            base_recommendations.extend([
                "Establish co-design process",
                "Define revenue sharing model"
            ])
        
        if "collaboration" in partnership_type.lower():
            base_recommendations.extend([
                "Plan exclusive launch events",
                "Leverage social media influencers"
            ])
        
        return random.sample(base_recommendations, min(5, len(base_recommendations)))

    def _generate_insights(self, brand_a: str, brand_b: str, partnership_type: str) -> list:
        """Generate market insights"""
        insights = [
            f"The {partnership_type.lower()} between {brand_a} and {brand_b} taps into cross-demographic appeal",
            "Luxury-streetwear collaborations show 40% higher engagement rates",
            "Limited edition releases create urgency and drive sales velocity",
            "Cross-brand partnerships expand market reach by average 25%",
            "Consumer appetite for brand collaborations continues to grow"
        ]
        
        return random.sample(insights, min(4, len(insights)))
