// Safe local fallback.
// Connect a real AI provider through a server endpoint for generated replies.

export async function getStylingReply({ message, clothes = [] } = {}) {
  if (!clothes.length) {
    return 'That sounds lovely! Add a few pieces to your wardrobe first, and I can suggest combinations using clothes you actually own.';
  }

  const names = clothes
    .slice(0, 3)
    .map(x => x.name)
    .filter(Boolean);

  return `I found these pieces in your saved wardrobe: ${names.join(', ')}. Tell me the occasion and what feels comfortable, and we can plan a combination. This is a local suggestion, not an AI-generated analysis.`;
}

export async function askAI(payload) {
  const endpoint = document.querySelector(
    'meta[name="yumori-ai-endpoint"]'
  )?.content;

  if (!endpoint) {
    return getStylingReply(payload);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('The styling assistant is temporarily unavailable.');
  }

  const result = await response.json();

  if (typeof result.reply !== 'string') {
    throw new Error('The AI service returned an unexpected response.');
  }

  return result.reply;
}
