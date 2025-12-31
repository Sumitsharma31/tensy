// AI Service for Tense Playground
// Uses Google Gemini AI for sentence analysis, translation, and AI assistance

export interface TenseAnalysisResult {
  detectedTense: string;
  tenseCategory: 'past' | 'present' | 'future';
  formula: string;
  englishTranslation: string;
  explanation: string;
  breakdown: {
    subject: string;
    verb: string;
    object?: string;
    auxiliaryVerb?: string;
  };
  alternativeTenses?: Array<{
    tense: string;
    sentence: string;
    usage: string;
  }>;
  confidence: number;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  tenseUsed?: string;
  grammarNotes?: string[];
}

export interface AiAssistantResponse {
  reply: string;
  suggestions?: string[];
  relatedTopics?: string[];
}

// Analyze a sentence for tense and grammar
export async function analyzeSentence(
  sentence: string,
  sourceLanguage: string = 'auto'
): Promise<TenseAnalysisResult> {
  try {
    console.log('Analyzing sentence:', sentence);

    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentence, sourceLanguage }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to analyze sentence');
    }

    const data = await response.json();
    return data as TenseAnalysisResult;
  } catch (error) {
    console.error('Error analyzing sentence:', error);
    throw error;
  }
}

// Translate text between languages
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'auto'
): Promise<TranslationResult> {
  try {
    console.log('Translating text:', text, 'to', targetLanguage);

    const response = await fetch('/api/ai/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage, sourceLanguage }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to translate text');
    }

    const data = await response.json();
    return data as TranslationResult;
  } catch (error) {
    console.error('Error translating text:', error);
    throw error;
  }
}

// AI Assistant for grammar help
export async function askAiAssistant(
  question: string,
  context?: string
): Promise<AiAssistantResponse> {
  try {
    console.log('Asking AI assistant:', question);

    const response = await fetch('/api/ai/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to get AI assistance');
    }

    const data = await response.json();
    return data as AiAssistantResponse;
  } catch (error) {
    console.error('Error with AI assistant:', error);
    throw error;
  }
}
