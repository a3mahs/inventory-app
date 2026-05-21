import Anthropic from '@anthropic-ai/sdk';
import logger from './logger';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function chatWithInventoryAI(
  messages: ChatMessage[],
  inventoryContext: string
): Promise<string> {
  try {
    const systemPrompt = `You are an intelligent inventory management assistant for InventoryPro.
You help users analyze their inventory, identify trends, optimize stock levels, and make data-driven decisions.

Current inventory context:
${inventoryContext}

You can help with:
- Stock analysis and optimization recommendations
- Identifying products that need reordering
- Sales trends and patterns analysis
- Cost optimization suggestions
- Supplier evaluation
- Demand forecasting insights
- Alert prioritization

Always respond in the same language the user writes in. Be concise, actionable, and data-driven.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const textContent = response.content.find((block) => block.type === 'text');
    return textContent?.text || 'Unable to generate response.';
  } catch (error) {
    logger.error(error, 'AI chat error');
    throw error;
  }
}

export async function generateInventoryInsights(data: {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
  topCategories: Array<{ name: string; count: number }>;
  recentMovements: number;
}): Promise<string> {
  try {
    const prompt = `Analyze this inventory data and provide 3 key insights and recommendations:

- Total Products: ${data.totalProducts}
- Low Stock Items: ${data.lowStockCount}
- Out of Stock: ${data.outOfStockCount}
- Total Inventory Value: $${data.totalValue.toFixed(2)}
- Top Categories: ${data.topCategories.map((c) => `${c.name} (${c.count})`).join(', ')}
- Recent Stock Movements (last 7 days): ${data.recentMovements}

Provide actionable insights in bullet points. Be concise.`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = response.content.find((block) => block.type === 'text');
    return textContent?.text || '';
  } catch (error) {
    logger.error(error, 'AI insights error');
    return '';
  }
}
