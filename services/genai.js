import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_GEMINI_API_KEY || '';

export async function analyzeFlights(flightA, flightB) {
  if (!flightA || !flightB) {
    return "Please select two flights to compare.";
  }

  if (!API_KEY) {
    console.error('[Gemini] API key is missing');
    console.log('[Gemini] Constants.expoConfig:', Constants.expoConfig);
    return "Error: Gemini API key is not configured.";
  }
  
  console.log('[Gemini] API key found, length:', API_KEY.length);

  const prompt = `Compare these two flights and provide a concise analysis of which one is better and why.
Consider factors like price, duration, stops, airline reputation, aircraft type, seat comfort, and legroom.

Flight A:
- Airline: ${flightA.title || 'Unknown'}
- Route: ${flightA.route || 'N/A'}
- Duration: ${flightA.duration || 'N/A'}
- Price: $${flightA.price || 'N/A'}
- Stops: ${flightA.status || 'N/A'}
- Aircraft: ${flightA.aircraft || 'N/A'}
- Seat: ${flightA.seat || 'N/A'}
- Legroom: ${flightA.legroom || 'N/A'}

Flight B:
- Airline: ${flightB.title || 'Unknown'}
- Route: ${flightB.route || 'N/A'}
- Duration: ${flightB.duration || 'N/A'}
- Price: $${flightB.price || 'N/A'}
- Stops: ${flightB.status || 'N/A'}
- Aircraft: ${flightB.aircraft || 'N/A'}
- Seat: ${flightB.seat || 'N/A'}
- Legroom: ${flightB.legroom || 'N/A'}

Provide a clear recommendation on which flight is better overall, considering value for money, convenience, and comfort. Keep the response concise (2-3 sentences).`;

  // First, get list of available models
  let availableModels = [];
  try {
    console.log('[Gemini] Fetching available models...');
    const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;
    const listResponse = await fetch(listUrl);
    const listData = await listResponse.json();
    
    if (listData.models) {
      availableModels = listData.models
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace('models/', ''));
      console.log('[Gemini] Available models:', availableModels);
    } else {
      console.log('[Gemini] Could not fetch models list, using defaults');
    }
  } catch (error) {
    console.log('[Gemini] Error fetching models list:', error.message);
  }

  // Use available models if we got them, otherwise try common ones
  const modelsToTry = availableModels.length > 0 
    ? availableModels 
    : [
        'gemini-pro',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.5-pro-latest',
        'gemini-2.0-flash-exp',
      ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`[Gemini] Trying model: ${modelName}`);
      
      const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${API_KEY}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.log(`[Gemini] Model ${modelName} failed:`, data.error?.message);
        continue; // Try next model
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        console.log(`[Gemini] Successfully generated response using ${modelName}`);
        return text;
      }
    } catch (error) {
      console.log(`[Gemini] Model ${modelName} error:`, error.message);
      continue; // Try next model
    }
  }

  // If all models failed
  return "Error: Could not generate AI analysis. Please check your API key and try again.";
}
