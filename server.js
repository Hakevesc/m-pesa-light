import express from 'express';
import cors from 'cors';
import { generateScreen, generateMissingComponent } from './api/gemini-client.js';
import { ScreenRenderer } from './utils/screen-renderer.js';
import { ComponentGenerator } from './utils/component-generator.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Load component catalog
const catalog = JSON.parse(fs.readFileSync(join(__dirname, 'components', 'component-catalog.json'), 'utf-8'));

const renderer = new ScreenRenderer(catalog);
const generator = new ComponentGenerator();

// API endpoint for screen generation
app.post('/api/generate-screen', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const screenSpec = await generateScreen(prompt, catalog);
    
    // Check for missing components
    const allComponents = Object.values(catalog.components).flat();
    const missingComponents = screenSpec.components
      .filter(comp => !allComponents.some(c => c.name === comp.type))
      .map(comp => ({ name: comp.type, description: comp.description || `Used in ${screenSpec.screen}` }));
    
    // Auto-save missing components
    for (const missing of missingComponents) {
      const component = await generateMissingComponent(missing.description, catalog);
      generator.saveComponent(component);
    }
    
    // Render the screen
    const output = renderer.renderScreen(screenSpec);
    
    res.json({
      screen: screenSpec.screen,
      html: output.html,
      figma: output.figma,
      missingComponents: missingComponents.map(c => c.name)
    });
    
  } catch (error) {
    console.error('Screen generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for component catalog
app.get('/api/components', (req, res) => {
  res.json(catalog);
});

// API endpoint for saving screens
app.post('/api/save-screen', (req, res) => {
  try {
    const { screenName, html } = req.body;
    const outputDir = join(process.cwd(), 'screens', 'ai-generated');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = screenName.toLowerCase().replace(/\s+/g, '-') + '.html';
    fs.writeFileSync(join(outputDir, fileName), html);
    
    res.json({ success: true, path: fileName });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API root — lists available endpoints
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: 'M-PESA AI Builder API is running',
    endpoints: [
      'GET  /api',
      'GET  /api/test',
      'GET  /api/components',
      'POST /api/generate-screen',
      'POST /api/save-screen'
    ]
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'M-PESA AI Builder API is running' });
});

app.listen(PORT, () => {
  console.log(`M-PESA AI Builder server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});