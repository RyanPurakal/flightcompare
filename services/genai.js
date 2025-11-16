const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

export async function analyzeFlights(flightA, flightB) {
  if (!flightA || !flightB) return "Please select two flights to compare.";

  const prompt = `
Compare these two flights and provide a concise analysis of which one is better and why.
Flight A: ${JSON.stringify(flightA, null, 2)}
Flight B: ${JSON.stringify(flightB, null, 2)}
Provide considerations like price, duration, stops, aircraft, and comfort.
`;

  try {
    const response = await fetch(
      `https://generative.googleapis.com/v1beta2/models/text-bison-001:generate?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          temperature: 0.7,
          maxOutputTokens: 500,
        }),
      }
    );

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.[0]?.text;
    return text || "No response generated.";
  } catch (error) {
    console.error("AI analysis error:", error);
    return "Error generating AI analysis.";
  }
}
