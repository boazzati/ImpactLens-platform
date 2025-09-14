import os
import logging
from typing import Dict, Any
from .openai_service import OpenAIService
from .mock_openai_service import MockOpenAIService

logger = logging.getLogger(__name__)

class HybridOpenAIService:
    """
    Hybrid service that tries real OpenAI first, falls back to mock on failure.
    This ensures we always try the real API for each request.
    """
    
    def __init__(self):
        self.openai_service = None
        self.mock_service = MockOpenAIService()
        self.openai_available = True
        
        # Try to initialize OpenAI service
        try:
            self.openai_service = OpenAIService()
            logger.info("Hybrid service initialized with OpenAI capability")
        except Exception as e:
            logger.warning(f"OpenAI service unavailable at startup: {str(e)}")
            self.openai_available = False

    def analyze_partnership(self, scenario_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Try OpenAI first, fall back to mock on failure.
        """
        
        # If OpenAI was never available, use mock
        if not self.openai_available or not self.openai_service:
            logger.info("Using mock service (OpenAI not available)")
            result = self.mock_service.analyze_partnership(scenario_data)
            result["service_used"] = "mock"
            return result
        
        # Try OpenAI first
        try:
            logger.info("Attempting real OpenAI analysis...")
            result = self.openai_service.analyze_partnership(scenario_data)
            
            if result["status"] == "success":
                logger.info("✅ Real OpenAI analysis successful")
                result["service_used"] = "openai"
                return result
            else:
                logger.warning(f"OpenAI returned error: {result.get('error', 'Unknown error')}")
                raise Exception(result.get('error', 'OpenAI service error'))
                
        except Exception as e:
            logger.warning(f"OpenAI failed, falling back to mock: {str(e)}")
            result = self.mock_service.analyze_partnership(scenario_data)
            result["service_used"] = "mock_fallback"
            result["openai_error"] = str(e)
            return result
