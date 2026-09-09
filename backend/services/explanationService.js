import { explanationEngine, ExplanationEngine } from './explanation/explanationEngine.js';
import { evidenceBuilder, EvidenceBuilder } from './explanation/evidenceBuilder.js';
import { explanationCache, ExplanationCache } from './explanation/explanationCache.js';
import { validateExplanation, countSentences, truncateToSentences } from './explanation/explanationValidator.js';
import { getFallbackExplanation, DETERMINISTIC_TEMPLATES, formatLanguage } from './explanation/explanationTemplates.js';

export {
  explanationEngine,
  ExplanationEngine,
  evidenceBuilder,
  EvidenceBuilder,
  explanationCache,
  ExplanationCache,
  validateExplanation,
  countSentences,
  truncateToSentences,
  getFallbackExplanation,
  DETERMINISTIC_TEMPLATES,
  formatLanguage,
};

export default explanationEngine;
