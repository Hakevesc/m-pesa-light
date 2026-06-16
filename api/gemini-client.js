import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Ensure env vars are loaded even when this module is imported before
// server.js calls dotenv.config() (ES module imports evaluate first).
dotenv.config();

// Lazily create the client so the key is read after dotenv has loaded.
let genAI = null;
function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Add it to your .env file.');
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function generateScreen(prompt, componentCatalog) {
  const model = getClient().getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: buildSystemPrompt(componentCatalog)
  });

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    });

    const response = result.response.text();
    return JSON.parse(response);
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Failed to generate screen: ${error.message}`);
  }
}

function buildSystemPrompt(catalog) {
  const availableComponents = [];
  
  Object.entries(catalog.components).forEach(([category, components]) => {
    components.forEach(comp => {
      availableComponents.push(`${comp.name} (${category}) - ${comp.description}`);
    });
  });

  return `You are an M-PESA Lehulum design system assistant. Build mobile screens using ONLY the components listed below.

Available Components:
${availableComponents.join('\n')}

Design Tokens:
- Primary color: ${catalog.designTokens.colors.Primary}
- Mobile width: ${catalog.designTokens.mobileWidth}
- Spacing: ${catalog.designTokens.spacing}
- Font: ${catalog.designTokens.fontFamily}

Rules:
- Return ONLY valid JSON
- Use exact component names from the list
- Include data-component and data-variant attributes for Figma export
- Do NOT include "PhoneFrame" as a component — the mobile device frame is added automatically. Return the actual screen content components (headers, cards, buttons, inputs, etc.).
- Every screen must contain at least 2 real content components.
- If you need a component not in the list, return: {"action": "create_component", "component": {"name": "...", "description": "..."}}

Expected JSON structure:
{
  "screen": "ScreenName",
  "components": [
    {"type": "ComponentName", "id": "optional-id", "props": {}, "variant": "default"}
  ]
}`;
}

export async function generateMissingComponent(description, catalog) {
  const model = getClient().getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `Create a reusable UI component for M-PESA Lehulum based on this description: ${description}
    
Return JSON with HTML template and CSS:
{
  "name": "ComponentName",
  "category": "category",
  "html": "<div class=\"component-wrapper\">...</div>",
  "css": ".component-wrapper { ... }"
}`
  });

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: description }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.5 }
    });
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('Failed to generate component:', error);
    throw error;
  }
}