# M-PESA AI Screen Builder

AI-powered component assembly system that generates mobile screens from natural language prompts.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm run ai:server
```

### 3. Open the Preview
Visit http://localhost:3001/ai-preview.html in your browser.

### 4. Generate Screens
Type a prompt like "Create a loan application screen" and click "Generate Screen".

## CLI Usage

Generate screens from command line:
```bash
npm run ai:build "loan application screen with amount input and apply button"
```

Output will be saved to `screens/ai-generated/loan-application.html`

## File Structure

```
/components/
  component-catalog.json   # Machine-readable component database
  button.html              # Existing components
  status-bar.html
  
/api/
  gemini-client.js         # Gemini API wrapper
  build-screen.js          # CLI screen builder
  prompts/
    screen-builder.txt     # Prompt template
  
/utils/
  screen-renderer.js       # HTML/CSS/Figma generators
  component-generator.js   # Missing component creator
  
/screens/ai-generated/     # Output folder
  loan-application.html
  airtime-topup.html
```

## Examples

- "Create a loan application screen with amount input, period selector, and apply button"
- "Build an airtime topup screen with phone number input and amount keypad"
- "Generate a bill payment screen with biller search and amount confirmation"
- "Create merchant payment screen with QR code scanning"

## Extending the Component Library

1. Add components to `components/component-catalog.json`
2. Create corresponding HTML/CSS files in `components/`
3. The AI will automatically discover them

## Security Note

The `.env` file contains your Gemini API key and is gitignored. Never commit it.