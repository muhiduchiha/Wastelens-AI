/**
 * WASTELENS RAG Service
 * Simple keyword-based retrieval from local knowledge base
 * Gemini used for synthesis — retrieval is deterministic
 */
import { getDb } from '../db/database.js';
import { getGeminiRAGSynthesis } from './geminiService.js';

/**
 * Retrieve relevant documents from knowledge base
 * Simple TF-IDF-inspired keyword matching
 */
export function retrieveDocuments(query, category = null, topK = 5) {
  const db = getDb();

  let sql = 'SELECT * FROM market_knowledge';
  const params = [];

  if (category) {
    sql += ' WHERE category = ?';
    params.push(category);
  }

  const allDocs = db.prepare(sql).all(...params);

  // Score documents by keyword relevance
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

  const scored = allDocs.map(doc => {
    const text = `${doc.title} ${doc.content} ${doc.category}`.toLowerCase();
    let score = 0;

    for (const term of queryTerms) {
      // Count occurrences
      const matches = (text.match(new RegExp(term, 'g')) || []).length;
      score += matches;

      // Title match gets bonus
      if (doc.title.toLowerCase().includes(term)) score += 3;
      if (doc.category.toLowerCase().includes(term)) score += 2;
    }

    return { ...doc, relevance_score: score };
  });

  return scored
    .filter(d => d.relevance_score > 0)
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, topK);
}

/**
 * Full RAG pipeline: retrieve + synthesize
 */
export async function queryRAG(query, category = null) {
  const retrieved = retrieveDocuments(query, category);

  // Build context from retrieved documents
  const context = retrieved.map(d =>
    `[${d.category.toUpperCase()}] ${d.title}:\n${d.content}`
  ).join('\n\n---\n\n');

  let synthesis = getFallbackSynthesis(query, retrieved);

  // Try Gemini synthesis
  try {
    synthesis = await getGeminiRAGSynthesis(query, context);
  } catch (e) {
    // Use deterministic fallback
  }

  return {
    query,
    retrieved_documents: retrieved.map(d => ({
      id: d.id,
      category: d.category,
      title: d.title,
      relevance_score: d.relevance_score,
      excerpt: d.content.substring(0, 200) + '...',
      source: d.source
    })),
    retrieved_count: retrieved.length,
    synthesis,
    pipeline: 'keyword_retrieval → context_assembly → gemini_synthesis',
    data_note: 'SIMULATED DEMO DATA — Local knowledge base with Bangladesh market context'
  };
}

function getFallbackSynthesis(query, docs) {
  if (docs.length === 0) {
    return `No specific market intelligence found for "${query}". Please check our knowledge base for related topics.`;
  }

  const topDoc = docs[0];
  return `Based on our local market knowledge base:\n\n**${topDoc.title}**\n\n${topDoc.content}\n\n*${docs.length} relevant documents retrieved. Synthesis generated from local knowledge base.*`;
}
