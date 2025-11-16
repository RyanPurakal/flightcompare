import { OPENAI_API_KEY } from '@env';

const OPENAI_API_KEY = OPENAI_API_KEY;

export const compareFlightsAI = async (flightA, flightB) => {
  const prompt = `
Compare these two flights and determine which is better overall for a traveler. Consider price, duration, stops, airline, legroom, seat, and any other relevant info.

Flight A: ${JSON.stringify(flightA, null, 2)}
Flight B: ${JSON.stringify(flightB, null, 2)}

Give a concise summary and declare which flight you recommend.
`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await res.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      console.warn('[AI] No response from OpenAI');
      return 'Unable to compare flights at this time.';
    }

    return data.choices[0].message.content;
  } catch (err) {
    console.error('[AI] Comparison error:', err);
    return 'Unable to compare flights at this time.';
  }
};
