/**
 * WASTELENS Agent Orchestrator
 * Coordinates all AI agents and produces final decisions
 */
import { forecastDemand, forecastAllProducts } from './forecastEngine.js';
import { calculateWasteRisk, calculateDaysRemaining } from './wasteEngine.js';
import { generatePricingRecommendation } from './pricingEngine.js';
import { retrieveDocuments } from './ragService.js';
import { getAgentReasoning } from './geminiService.js';
import { broadcastEvent } from './eventStream.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Run all agents and produce orchestrated decisions
 */
export async function runAllAgents(db) {
  const startTime = Date.now();
  const agentResults = [];

  broadcastEvent({ type: 'agent_start', agent: 'orchestrator', message: 'Starting agent pipeline...' });

  // === DEMAND AGENT ===
  broadcastEvent({ type: 'agent_start', agent: 'demand', message: 'Forecasting demand...' });
  const demandResult = await runDemandAgent(db);
  agentResults.push(demandResult);
  saveAgentDecision(db, 'DemandAgent', 'forecast', demandResult);
  broadcastEvent({ type: 'agent_complete', agent: 'demand', result: demandResult });

  // === INVENTORY AGENT ===
  broadcastEvent({ type: 'agent_start', agent: 'inventory', message: 'Analyzing inventory levels...' });
  const inventoryResult = await runInventoryAgent(db, demandResult);
  agentResults.push(inventoryResult);
  saveAgentDecision(db, 'InventoryAgent', 'analysis', inventoryResult);
  broadcastEvent({ type: 'agent_complete', agent: 'inventory', result: inventoryResult });

  // === WASTE AGENT ===
  broadcastEvent({ type: 'agent_start', agent: 'waste', message: 'Detecting waste risk...' });
  const wasteResult = await runWasteAgent(db, demandResult, inventoryResult);
  agentResults.push(wasteResult);
  saveAgentDecision(db, 'WasteAgent', 'risk_assessment', wasteResult);
  broadcastEvent({ type: 'agent_complete', agent: 'waste', result: wasteResult });

  // === MARKET INTELLIGENCE AGENT (RAG) ===
  broadcastEvent({ type: 'agent_start', agent: 'market', message: 'Retrieving market context...' });
  const marketResult = await runMarketAgent(db, wasteResult);
  agentResults.push(marketResult);
  saveAgentDecision(db, 'MarketAgent', 'rag_retrieval', marketResult);
  broadcastEvent({ type: 'agent_complete', agent: 'market', result: marketResult });

  // === PRICING AGENT ===
  broadcastEvent({ type: 'agent_start', agent: 'pricing', message: 'Generating discount recommendations...' });
  const pricingResult = await runPricingAgent(db, wasteResult);
  agentResults.push(pricingResult);
  saveAgentDecision(db, 'PricingAgent', 'discount_recommendation', pricingResult);
  broadcastEvent({ type: 'agent_complete', agent: 'pricing', result: pricingResult });

  // === PROCUREMENT AGENT ===
  broadcastEvent({ type: 'agent_start', agent: 'procurement', message: 'Optimizing purchase orders...' });
  const procurementResult = await runProcurementAgent(db, demandResult, inventoryResult, marketResult);
  agentResults.push(procurementResult);
  saveAgentDecision(db, 'ProcurementAgent', 'purchase_recommendation', procurementResult);
  broadcastEvent({ type: 'agent_complete', agent: 'procurement', result: procurementResult });

  // === ORCHESTRATOR FINAL DECISION ===
  broadcastEvent({ type: 'agent_start', agent: 'orchestrator', message: 'Generating final decision...' });
  const orchestratorResult = await runOrchestratorAgent(db, {
    demand: demandResult,
    inventory: inventoryResult,
    waste: wasteResult,
    market: marketResult,
    pricing: pricingResult,
    procurement: procurementResult
  });
  saveAgentDecision(db, 'OrchestratorAgent', 'final_decision', orchestratorResult);
  broadcastEvent({ type: 'agent_complete', agent: 'orchestrator', result: orchestratorResult });

  const duration = Date.now() - startTime;

  return {
    agent_run_id: uuidv4(),
    duration_ms: duration,
    agents: {
      demand: demandResult,
      inventory: inventoryResult,
      waste: wasteResult,
      market: marketResult,
      pricing: pricingResult,
      procurement: procurementResult,
      orchestrator: orchestratorResult
    },
    summary: {
      high_risk_items: wasteResult.high_risk_count,
      discount_opportunities: pricingResult.recommendations?.length || 0,
      procurement_actions: procurementResult.actions?.length || 0,
      final_decision: orchestratorResult.final_decision,
    },
    generated_at: new Date().toISOString(),
    data_note: 'SIMULATED DEMO DATA — Agent decisions using demo inventory'
  };
}

async function runDemandAgent(db) {
  const forecasts = forecastAllProducts(db, 7);
  const totalForecast = forecasts.reduce((s, f) => s + f.total, 0);
  const avgConfidence = forecasts.reduce((s, f) => s + f.confidence, 0) / forecasts.length;

  // Top 5 by forecast volume
  const topItems = [...forecasts].sort((a, b) => b.total - a.total).slice(0, 5);

  let aiInsight = 'Demand forecast completed using weighted moving average with day-of-week seasonality.';
  try {
    const result = await getAgentReasoning('Demand Forecasting Agent', {
      total_7day_demand: totalForecast,
      top_demand_items: topItems.map(f => ({ name: f.product_name, demand_7d: f.total })),
      avg_confidence: avgConfidence,
      day_of_week: new Date().toLocaleString('en-US', { weekday: 'long' })
    });
    if (result) aiInsight = result.reasoning;
  } catch (e) {}

  return {
    agent: 'DemandAgent',
    status: 'completed',
    total_7day_demand: parseFloat(totalForecast.toFixed(1)),
    avg_confidence: parseFloat(avgConfidence.toFixed(2)),
    top_demand_items: topItems.slice(0, 5),
    all_forecasts: forecasts,
    insight: aiInsight,
    timestamp: new Date().toISOString()
  };
}

async function runInventoryAgent(db, demandResult) {
  const inventory = db.prepare(`
    SELECT i.*, p.name, p.category, p.shelf_life_days, p.reorder_point, p.cost_price, p.normal_price
    FROM inventory i JOIN products p ON i.product_id = p.id
  `).all();

  const enriched = inventory.map(item => {
    const daysRemaining = calculateDaysRemaining(item.expiry_date);
    const forecast = demandResult.all_forecasts.find(f => f.product_id === item.product_id);
    const demand3d = forecast ? forecast.total * (3 / 7) : 0;
    const wasteRisk = calculateWasteRisk(item.quantity, demand3d, daysRemaining, item.shelf_life_days);
    return {
      ...item,
      days_remaining: parseFloat(daysRemaining.toFixed(2)),
      demand_3d: parseFloat(demand3d.toFixed(1)),
      waste_risk: parseFloat(wasteRisk.toFixed(3)),
      risk_level: wasteRisk > 0.7 ? 'HIGH' : wasteRisk > 0.4 ? 'MEDIUM' : 'LOW',
      needs_reorder: item.quantity <= item.reorder_point,
      inventory_days: parseFloat((item.quantity / Math.max(0.1, demand3d / 3)).toFixed(1))
    };
  });

  const highRisk = enriched.filter(i => i.risk_level === 'HIGH');
  const needsReorder = enriched.filter(i => i.needs_reorder);

  return {
    agent: 'InventoryAgent',
    status: 'completed',
    total_items: enriched.length,
    high_risk_count: highRisk.length,
    medium_risk_count: enriched.filter(i => i.risk_level === 'MEDIUM').length,
    low_risk_count: enriched.filter(i => i.risk_level === 'LOW').length,
    needs_reorder_count: needsReorder.length,
    high_risk_items: highRisk,
    reorder_items: needsReorder.slice(0, 5),
    total_inventory_value: parseFloat(enriched.reduce((s, i) => s + i.quantity * i.cost_price, 0).toFixed(0)),
    timestamp: new Date().toISOString()
  };
}

async function runWasteAgent(db, demandResult, inventoryResult) {
  const highRiskItems = inventoryResult.high_risk_items;

  const totalAtRiskKg = highRiskItems.reduce((s, i) => s + Math.max(0, i.quantity - i.demand_3d), 0);
  const totalAtRiskValue = highRiskItems.reduce((s, i) => s + Math.max(0, i.quantity - i.demand_3d) * i.cost_price, 0);
  const co2eAtRisk = totalAtRiskKg * 2.5;

  let aiInsight = `${highRiskItems.length} items detected with high spoilage risk. Total ${totalAtRiskKg.toFixed(1)}kg (৳${Math.round(totalAtRiskValue)}) at risk of becoming waste.`;

  try {
    const result = await getAgentReasoning('Waste Prevention Agent', {
      high_risk_items: highRiskItems.map(i => ({
        name: i.name,
        quantity: i.quantity,
        days_remaining: i.days_remaining,
        waste_risk: i.waste_risk
      })),
      total_at_risk_kg: totalAtRiskKg,
      total_at_risk_value: totalAtRiskValue
    });
    if (result?.reasoning) aiInsight = result.reasoning;
  } catch (e) {}

  return {
    agent: 'WasteAgent',
    status: 'completed',
    high_risk_count: highRiskItems.length,
    total_at_risk_kg: parseFloat(totalAtRiskKg.toFixed(1)),
    total_at_risk_value: parseFloat(totalAtRiskValue.toFixed(0)),
    co2e_at_risk: parseFloat(co2eAtRisk.toFixed(1)),
    high_risk_items: highRiskItems.slice(0, 8),
    insight: aiInsight,
    timestamp: new Date().toISOString()
  };
}

async function runMarketAgent(db, wasteResult) {
  // Build query from high-risk items
  const riskItems = wasteResult.high_risk_items.slice(0, 3).map(i => i.name).join(', ');
  const query = `pricing demand ${riskItems} Bangladesh`;

  const docs = retrieveDocuments(query, null, 4);
  const contextSummary = docs.map(d => `${d.title}: ${d.content.substring(0, 150)}`).join('\n');

  return {
    agent: 'MarketAgent',
    status: 'completed',
    query,
    retrieved_docs: docs.length,
    documents: docs.map(d => ({ title: d.title, category: d.category, relevance: d.relevance_score })),
    context_summary: contextSummary,
    market_insight: docs.length > 0
      ? `Retrieved ${docs.length} relevant market knowledge entries. Key context: ${docs[0]?.title}`
      : 'No specific market context retrieved for current risk items.',
    timestamp: new Date().toISOString()
  };
}

async function runPricingAgent(db, wasteResult) {
  const recommendations = [];

  for (const item of wasteResult.high_risk_items.slice(0, 5)) {
    try {
      const rec = await generatePricingRecommendation(db, item.product_id);
      if (rec.discount_pct > 0) recommendations.push(rec);
    } catch (e) {}
  }

  return {
    agent: 'PricingAgent',
    status: 'completed',
    recommendations_count: recommendations.length,
    recommendations: recommendations,
    total_potential_recovery: recommendations.reduce((s, r) => s + (r.surplus * r.recommended_price), 0),
    timestamp: new Date().toISOString()
  };
}

async function runProcurementAgent(db, demandResult, inventoryResult, marketResult) {
  const actions = [];

  // Check items that need reordering
  for (const item of inventoryResult.reorder_items) {
    const forecast = demandResult.all_forecasts.find(f => f.product_id === item.product_id);
    if (!forecast) continue;

    const dailyDemand = forecast.daily_average || 0;
    const targetDays = item.shelf_life_days <= 3 ? 2 : item.shelf_life_days <= 7 ? 5 : 14;
    const targetStock = dailyDemand * targetDays;
    const orderQty = Math.max(0, targetStock - item.quantity);

    if (orderQty > 0) {
      // Check if market conditions suggest delay
      const marketDocs = retrieveDocuments(`${item.name} price supply`, null, 2);
      const marketNote = marketDocs.length > 0 ? marketDocs[0].title : 'No specific market data';

      actions.push({
        product_id: item.product_id,
        product_name: item.name,
        current_stock: item.quantity,
        recommended_order_qty: parseFloat(orderQty.toFixed(1)),
        unit: item.unit,
        estimated_cost: parseFloat((orderQty * item.cost_price).toFixed(0)),
        target_stock_days: targetDays,
        urgency: item.quantity === 0 ? 'CRITICAL' : item.quantity < item.reorder_point * 0.5 ? 'HIGH' : 'MEDIUM',
        supplier_lead_days: item.supplier_lead_days,
        market_context: marketNote
      });
    }
  }

  // Check for over-stocked HIGH RISK items — recommend DO NOT ORDER
  const doNotOrder = inventoryResult.high_risk_items.filter(i =>
    i.quantity > i.demand_3d * 1.5 && i.waste_risk > 0.6
  ).map(i => ({
    product_name: i.name,
    reason: `Current stock (${i.quantity.toFixed(1)}${i.unit}) significantly exceeds 3-day demand (${i.demand_3d.toFixed(1)}${i.unit}). Do not reorder until inventory is reduced.`,
    waste_risk: i.waste_risk
  }));

  return {
    agent: 'ProcurementAgent',
    status: 'completed',
    actions_count: actions.length,
    actions,
    do_not_order: doNotOrder,
    total_order_value: parseFloat(actions.reduce((s, a) => s + a.estimated_cost, 0).toFixed(0)),
    timestamp: new Date().toISOString()
  };
}

async function runOrchestratorAgent(db, agentOutputs) {
  const { demand, inventory, waste, market, pricing, procurement } = agentOutputs;

  // Build orchestrator reasoning
  const summary = {
    high_risk_items: waste.high_risk_count,
    discount_opportunities: pricing.recommendations_count,
    procurement_actions: procurement.actions_count,
    do_not_order_count: procurement.do_not_order?.length || 0,
    total_at_risk_value: waste.total_at_risk_value,
    top_risk_item: waste.high_risk_items[0]?.name || 'None'
  };

  let finalDecision = 'MIXED_ACTIONS_REQUIRED';
  let reasoning = '';

  // Determine priority decision
  if (waste.high_risk_count > 5) {
    finalDecision = 'IMMEDIATE_ACTION — HIGH WASTE RISK';
    reasoning = `${waste.high_risk_count} items are at critical waste risk. Immediate discounting and demand stimulation required.`;
  } else if (pricing.recommendations_count > 0 && procurement.actions_count > 0) {
    finalDecision = 'DISCOUNT_AND_REORDER';
    reasoning = `Apply ${pricing.recommendations_count} discount recommendations to clear at-risk inventory while ordering ${procurement.actions_count} low-stock items.`;
  } else if (pricing.recommendations_count > 0) {
    finalDecision = 'APPLY_DISCOUNTS';
    reasoning = `${pricing.recommendations_count} products require dynamic discounting to prevent waste.`;
  } else if (procurement.actions_count > 0) {
    finalDecision = 'REORDER_REQUIRED';
    reasoning = `${procurement.actions_count} items need restocking based on demand forecast.`;
  } else {
    finalDecision = 'OPTIMAL — MONITOR';
    reasoning = 'Inventory levels are well-aligned with demand. Continue monitoring.';
  }

  // Try to get Gemini orchestrator summary
  let aiSummary = reasoning;
  try {
    const result = await getAgentReasoning('Orchestrator Agent', {
      demand_summary: { total_7d: demand.total_7day_demand, confidence: demand.avg_confidence },
      inventory_summary: { high_risk: inventory.high_risk_count, total_items: inventory.total_items },
      waste_summary: { at_risk_kg: waste.total_at_risk_kg, at_risk_value: waste.total_at_risk_value },
      pricing_summary: { recommendations: pricing.recommendations_count },
      procurement_summary: { actions: procurement.actions_count, do_not_order: procurement.do_not_order?.length }
    });
    if (result?.reasoning) aiSummary = result.reasoning;
    if (result?.decision) finalDecision = result.decision;
  } catch (e) {}

  return {
    agent: 'OrchestratorAgent',
    status: 'completed',
    final_decision: finalDecision,
    reasoning: aiSummary,
    priority_actions: [
      ...pricing.recommendations.slice(0, 3).map(r => ({
        type: 'DISCOUNT',
        product: r.product_name,
        action: `Apply ${r.discount_pct}% discount (৳${r.original_price} → ৳${r.recommended_price})`,
        urgency: r.waste_risk > 0.8 ? 'CRITICAL' : 'HIGH'
      })),
      ...procurement.actions.slice(0, 2).map(a => ({
        type: 'ORDER',
        product: a.product_name,
        action: `Order ${a.recommended_order_qty} ${a.unit} (est. ৳${a.estimated_cost})`,
        urgency: a.urgency
      }))
    ],
    agent_consensus: {
      demand_agent: `7-day demand forecast: ${demand.total_7day_demand} units (confidence: ${Math.round(demand.avg_confidence * 100)}%)`,
      inventory_agent: `${inventory.high_risk_count} high-risk, ${inventory.needs_reorder_count} need reorder`,
      waste_agent: `${waste.total_at_risk_kg}kg at risk (৳${waste.total_at_risk_value})`,
      market_agent: `${market.retrieved_docs} market docs retrieved`,
      pricing_agent: `${pricing.recommendations_count} discount opportunities found`,
      procurement_agent: `${procurement.actions_count} purchase actions, ${procurement.do_not_order?.length || 0} DO NOT ORDER`
    },
    timestamp: new Date().toISOString()
  };
}

function saveAgentDecision(db, agentName, decisionType, data) {
  try {
    db.prepare(`
      INSERT INTO agent_decisions (id, agent_name, decision_type, output_data, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).run(uuidv4(), agentName, decisionType, JSON.stringify(data));
  } catch (e) {
    // Non-critical
  }
}
