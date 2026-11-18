/**
 * WASTELENS Gemini Service
 * Multi-Key Pool with Round-Robin Rotation & Auto-Failover
 * Uses @google/genai with interactions API
 * Graceful fallbacks when all keys or API are unavailable
 */
import { GoogleGenAI } from '@google/genai';

/**
 * Key Manager for handling multiple Gemini API Keys (up to 10+ keys)
 * - Round-robin rotation
 * - Automatic retry on rate-limit / 429 / 503 / quota error with next key
 */
class GeminiKeyPool {
  constructor() {
    this.keys = [];
    this.currentIndex = 0;
    this.clients = new Map();
    this.refreshKeys();
  }

  refreshKeys() {
    const gathered = [];

    // 1. Check GEMINI_API_KEYS (comma or newline separated)
    if (process.env.GEMINI_API_KEYS) {
      const parts = process.env.GEMINI_API_KEYS.split(/[,\n]+/).map(k => k.trim()).filter(Boolean);
      gathered.push(...parts);
    }

    // 2. Check numbered keys GEMINI_API_KEY_1 through GEMINI_API_KEY_20
    for (let i = 1; i <= 20; i++) {
      const k = process.env[`GEMINI_API_KEY_${i}`];
      if (k && k.trim()) gathered.push(k.trim());
    }

    // 3. Check legacy single GEMINI_API_KEY (can also be comma-separated)
    if (process.env.GEMINI_API_KEY) {
      const parts = process.env.GEMINI_API_KEY.split(/[,\n]+/).map(k => k.trim()).filter(Boolean);
      gathered.push(...parts);
    }

    // Deduplicate
    this.keys = Array.from(new Set(gathered));

    if (this.keys.length > 0) {
      console.log(`[Gemini Key Pool] Loaded ${this.keys.length} API key(s) with auto-rotation enabled.`);
    }
  }

  hasKeys() {
    return this.keys.length > 0;
  }

  getClientForKey(apiKey) {
    if (!this.clients.has(apiKey)) {
      this.clients.set(apiKey, new GoogleGenAI({ apiKey }));
    }
    return this.clients.get(apiKey);
  }

  /**
   * Executes an operation with automatic rotation and failover across all keys.
   */
  async execute(operationName, fn) {
    if (this.keys.length === 0) {
      throw new Error('No Gemini API keys configured');
    }

    let lastError = null;
    const total = this.keys.length;

    for (let attempt = 0; attempt < total; attempt++) {
      const keyIndex = (this.currentIndex + attempt) % total;
      const apiKey = this.keys[keyIndex];
      const client = this.getClientForKey(apiKey);
      const maskedKey = apiKey.substring(0, 6) + '...' + apiKey.substring(apiKey.length - 4);

      try {
        const result = await fn(client, keyIndex);
        // On success, advance index for round-robin
        this.currentIndex = (keyIndex + 1) % total;
        return result;
      } catch (err) {
        lastError = err;
        console.warn(`⚠️ [Gemini Key Pool] ${operationName} failed on Key #${keyIndex + 1} (${maskedKey}): ${err.message}`);
        console.warn(`🔄 Rotating to next key in pool... (attempt ${attempt + 1}/${total})`);
      }
    }

    throw lastError;
  }
}

export const keyPool = new GeminiKeyPool();

// Configurable model name: defaults to gemini-3.1-flash-lite (fast, standard free quota)
// Can be set to gemini-flash-latest, gemini-3.8-flash, etc. via GEMINI_MODEL in .env
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

/**
 * Get AI explanation for a pricing decision
 */
export async function getGeminiExplanation(context) {
  if (!keyPool.hasKeys()) return null;

  const prompt = `You are WASTELENS AI, a food waste prevention system for a Bangladesh restaurant.

Provide a concise, professional pricing recommendation explanation (2-3 sentences) for this situation:

Product: ${context.product}
Current Stock: ${context.quantity} units
Expected Demand: ${context.demand} units  
Hours Until Expiry: ${Math.round(context.daysRemaining * 24)}h
Waste Risk: ${Math.round(context.wasteRisk * 100)}%
Recommended Discount: ${context.discount}%
Price: ৳${context.originalPrice} → ৳${Math.round(context.newPrice)}

Explain why this discount is recommended. Be specific, data-driven, and concise. No headers, just 2-3 sentences.`;

  try {
    return await keyPool.execute('PricingExplanation', async (client) => {
      const interaction = await client.interactions.create({
        model: MODEL,
        input: prompt,
        store: false,
      });
      return interaction.output_text;
    });
  } catch (e) {
    console.error('[Gemini] All keys failed for pricing explanation:', e.message);
    return null;
  }
}

/**
 * RAG synthesis — combine retrieved context with Gemini reasoning
 */
export async function getGeminiRAGSynthesis(query, context) {
  if (!keyPool.hasKeys()) throw new Error('Gemini API not available');

  const prompt = `You are the WASTELENS Market Intelligence Agent for a Bangladesh restaurant.

Using ONLY the following market knowledge context, answer the user query concisely and practically.
If the context doesn't cover the query, say so clearly. Do not invent data.

MARKET KNOWLEDGE CONTEXT:
${context}

USER QUERY: ${query}

Provide a structured, actionable response. Use ৳ for prices. Reference specific data from the context.`;

  return await keyPool.execute('RAGSynthesis', async (client) => {
    const interaction = await client.interactions.create({
      model: MODEL,
      input: prompt,
      store: false,
    });
    return interaction.output_text;
  });
}

/**
 * Agent reasoning — used by orchestrator for decision summaries
 */
export async function getAgentReasoning(agentName, agentInputs) {
  if (!keyPool.hasKeys()) return null;

  const prompt = `You are the WASTELENS ${agentName} for a Bangladesh restaurant inventory system.

Analyze the following data and provide a structured decision with reasoning:

${JSON.stringify(agentInputs, null, 2)}

Respond in JSON format:
{
  "decision": "BUY | DO_NOT_BUY | DISCOUNT | MONITOR | ACTION_REQUIRED",
  "confidence": 0.0-1.0,
  "reasoning": "2-3 sentence explanation",
  "key_factors": ["factor1", "factor2"],
  "recommended_action": "specific action to take",
  "expected_impact": "expected outcome"
}`;

  try {
    return await keyPool.execute(`AgentReasoning(${agentName})`, async (client) => {
      const interaction = await client.interactions.create({
        model: MODEL,
        input: prompt,
        store: false,
      });

      const text = interaction.output_text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { decision: 'MONITOR', reasoning: text, confidence: 0.7 };
    });
  } catch (e) {
    console.error(`[Gemini] All keys failed for agent reasoning (${agentName}):`, e.message);
    return null;
  }
}

/**
 * Vision analysis — analyze shelf image for inventory
 */
export async function analyzeImageWithGemini(imageBase64, mimeType) {
  if (!keyPool.hasKeys()) throw new Error('Gemini API not available');

  const prompt = `You are WASTELENS Vision AI analyzing a food store/restaurant shelf image.

Identify all visible food items and estimate their quantities. Return ONLY valid JSON in this exact format:
{
  "items": [
    {
      "item": "product name",
      "estimated_quantity": number,
      "unit": "kg|pcs|L|dozen",
      "confidence": 0.0-1.0,
      "condition": "good|fair|poor",
      "category": "Protein|Vegetable|Fruit|Dairy|Grain|Bakery|Ready Food|Other",
      "notes": "any relevant observation"
    }
  ],
  "shelf_condition": "well-stocked|adequate|low-stock|empty",
  "low_stock_areas": ["description of empty/low areas"],
  "general_observations": "overall shelf state",
  "ai_confidence": 0.0-1.0
}

Be conservative with estimates. Flag uncertain items with low confidence.`;

  return await keyPool.execute('ShelfVision', async (client) => {
    const interaction = await client.interactions.create({
      model: MODEL,
      input: [
        { type: 'text', text: prompt },
        { type: 'image', data: imageBase64, mime_type: mimeType }
      ],
      store: false,
    });

    const text = interaction.output_text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Could not parse vision response');
  });
}

/**
 * AI Copilot — conversational assistant with app context
 */
export async function runCopilotTurn(message, context, previousInteractionId = null) {
  if (!keyPool.hasKeys()) throw new Error('Gemini API not available');

  const systemContext = `You are WASTELENS AI Copilot, an intelligent food waste prevention assistant for a Bangladesh restaurant.

Current application data:
${JSON.stringify(context, null, 2)}

You help users understand:
- What to buy and what not to buy
- Which products are at highest waste risk  
- Why specific discounts were recommended
- Which inventory to use first (FIFO + risk-based)
- Root causes of waste
- Market intelligence and procurement decisions

Always reference specific data from the context. Use ৳ for prices. Be concise and actionable.
If asked about something not in the context, say clearly you don't have that data.`;

  return await keyPool.execute('CopilotTurn', async (client) => {
    const params = {
      model: MODEL,
      system_instruction: systemContext,
      input: message,
      store: true,
    };

    if (previousInteractionId) {
      params.previous_interaction_id = previousInteractionId;
    }

    try {
      const interaction = await client.interactions.create(params);
      return { text: interaction.output_text, interaction_id: interaction.id };
    } catch (err) {
      // If previousInteractionId failed (e.g. rotated to a different project key), retry clean
      if (previousInteractionId) {
        delete params.previous_interaction_id;
        const fallbackInteraction = await client.interactions.create(params);
        return { text: fallbackInteraction.output_text, interaction_id: fallbackInteraction.id };
      }
      throw err;
    }
  });
}
