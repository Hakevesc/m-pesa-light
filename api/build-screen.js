import { generateScreen, generateMissingComponent } from './gemini-client.js';
import { ScreenRenderer } from '../utils/screen-renderer.js';
import { ComponentGenerator } from '../utils/component-generator.js';
import fs from 'fs';
import path from 'path';

async function buildScreenFromPrompt(prompt) {
  const catalog = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'components', 'component-catalog.json'), 'utf-8')
  );
  
  const renderer = new ScreenRenderer(catalog);
  const generator = new ComponentGenerator(catalog);
  
  try {
    // Generate screen using Gemini
    const screenSpec = await generateScreen(prompt, catalog);
    
    // Check for missing components
    const missingComponents = screenSpec.components
      .filter(comp => !catalog.components.button?.some(c => c.name === comp.type) &&
                       !catalog.components.input?.some(c => c.name === comp.type) &&
                       !catalog.components.card?.some(c => c.name === comp.type) &&
                       !catalog.components.navigation?.some(c => c.name === comp.type) &&
                       !catalog.components.layout?.some(c => c.name === comp.type) &&
                       !catalog.components.overlay?.some(c => c.name === comp.type))
      .map(comp => ({ name: comp.type, description: comp.description || `Used in ${screenSpec.screen}` }));
    
    // Generate missing components
    for (const missing of missingComponents) {
      console.log(`Generating missing component: ${missing.name}`);
      const component = await generateMissingComponent(missing.description, catalog);
      generator.saveComponent(component);
    }
    
    // Render the screen
    const output = renderer.renderScreen(screenSpec);
    
    // Save output
    const outputDir = path.join(process.cwd(), 'screens', 'ai-generated');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const fileName = screenSpec.screen.toLowerCase().replace(/\s+/g, '-') + '.html';
    const filePath = path.join(outputDir, fileName);
    
    fs.writeFileSync(filePath, output.html);
    
    // Also save the Figma JSON
    fs.writeFileSync(filePath.replace('.html', '.figma.json'), JSON.stringify(output.figma, null, 2));
    
    console.log('Screen generated:', filePath);
    return output;
    
  } catch (error) {
    console.error('Build failed:', error.message);
    throw error;
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const prompt = process.argv[2];
  if (!prompt) {
    console.log('Usage: node build-screen.js "your prompt here"');
    process.exit(1);
  }
  
  buildScreenFromPrompt(prompt)
    .then(() => console.log('Done!'))
    .catch(err => console.error('Error:', err));
}