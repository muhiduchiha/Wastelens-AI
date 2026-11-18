/**
 * WASTELENS Vision Service
 * Gemini Vision for shelf image analysis with fallback
 */
import { analyzeImageWithGemini } from './geminiService.js';

const DEMO_FALLBACK = {
  items: [
    { item: 'Chicken Breast', estimated_quantity: 8.5, unit: 'kg', confidence: 0.82, condition: 'good', category: 'Protein', notes: 'Properly stored, fresh appearance' },
    { item: 'Tomatoes', estimated_quantity: 12, unit: 'kg', confidence: 0.88, condition: 'good', category: 'Vegetable', notes: 'Mixed ripeness, some near peak' },
    { item: 'Spinach', estimated_quantity: 3, unit: 'kg', confidence: 0.75, condition: 'fair', category: 'Vegetable', notes: 'Some wilting visible — use soon' },
    { item: 'Fresh Milk', estimated_quantity: 20, unit: 'L', confidence: 0.90, condition: 'good', category: 'Dairy', notes: 'Refrigerated, adequate stock' },
    { item: 'Eggs', estimated_quantity: 5, unit: 'dozen', confidence: 0.85, condition: 'good', category: 'Protein', notes: 'Well organized, no visible damage' },
    { item: 'Banana', estimated_quantity: 8, unit: 'dozen', confidence: 0.78, condition: 'fair', category: 'Fruit', notes: 'Yellowing — discount recommended soon' },
    { item: 'White Bread', estimated_quantity: 15, unit: 'loaf', confidence: 0.92, condition: 'good', category: 'Bakery', notes: 'Fresh stock visible' },
  ],
  shelf_condition: 'adequate',
  low_stock_areas: ['Bottom shelf right — appears empty', 'Middle section — protein area may need restocking'],
  general_observations: 'Shelf is moderately stocked. Some perishables showing signs of aging. Recommend FIFO rotation.',
  ai_confidence: 0.83,
  is_demo: true
};

export async function analyzeShelfImage(imageBase64, mimeType = 'image/jpeg') {
  if (!imageBase64) {
    // No image — return demo data
    return {
      ...DEMO_FALLBACK,
      analysis_note: 'AI ESTIMATE — Verify manually. Demo data shown (no image provided).',
      is_demo: true,
      timestamp: new Date().toISOString()
    };
  }

  try {
    const result = await analyzeImageWithGemini(imageBase64, mimeType);
    return {
      ...result,
      analysis_note: 'AI ESTIMATE — Verify manually. Gemini Vision analysis of uploaded image.',
      is_demo: false,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error('[Vision] Gemini analysis failed, using demo fallback:', err.message);
    return {
      ...DEMO_FALLBACK,
      analysis_note: 'AI ESTIMATE — Verify manually. Demo fallback (Gemini Vision unavailable).',
      error_note: `Vision API error: ${err.message}`,
      is_demo: true,
      timestamp: new Date().toISOString()
    };
  }
}
