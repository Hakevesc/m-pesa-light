import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ComponentGenerator {
  constructor(catalogPath = path.join(__dirname, '..', 'components', 'component-catalog.json')) {
    this.catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  }

  generateComponent(componentSpec) {
    const { name, description, category } = componentSpec;
    
    // Determine the best category if not provided
    const finalCategory = category || this.inferCategory(name);
    
    const html = this.generateHTML(name, componentSpec);
    const css = this.generateCSS(name, componentSpec);
    
    return {
      name,
      category: finalCategory,
      html,
      css,
      description
    };
  }

  inferCategory(name) {
    const lower = name.toLowerCase();
    if (lower.includes('button') || lower.includes('btn')) return 'button';
    if (lower.includes('input') || lower.includes('field') || lower.includes('text')) return 'input';
    if (lower.includes('card') || lower.includes('summary')) return 'card';
    if (lower.includes('nav') || lower.includes('bar') || lower.includes('header')) return 'navigation';
    if (lower.includes('modal') || lower.includes('popup') || lower.includes('dialog')) return 'overlay';
    if (lower.includes('list') || lower.includes('item') || lower.includes('row')) return 'list';
    return 'layout';
  }

  generateHTML(name, spec) {
    const className = this.toClassName(name);
    const examples = {
      Timeline: `<div class="${className}">
<div class="${className}-item">
<span class="${className}-dot"></span>
<div class="${className}-content">
<span class="${className}-title">Transaction</span>
<span class="${className}-date">Today, 8:34 AM</span>
<span class="${className}-amount">1,050.00 ETB</span>
</div>
</div>
</div>`,
      Dropdown: `<div class="${className}">
<button class="${className}-trigger">Select Option</button>
<div class="${className}-menu">
<div class="${className}-option">Option 1</div>
<div class="${className}-option">Option 2</div>
</div>
</div>`,
      Checkbox: `<label class="${className}">
<input type="checkbox">
<span class="${className}-box"></span>
<span class="${className}-label">Label</span>
</label>`,
      Radio: `<label class="${className}">
<input type="radio" name="radio">
<span class="${className}-dot"></span>
<span class="${className}-label">Label</span>
</label>`,
      Toggle: `<label class="${className}">
<input type="checkbox">
<span class="${className}-switch"></span>
</label>`
    };
    
    return examples[name] || `<div class="${className}" data-component="${name}">
<!-- TODO: Implement ${name} component -->
</div>`;
  }

  generateCSS(name, spec) {
    const className = this.toClassName(name);
    
    const cssMap = {
      Timeline: `.${className} { display: flex; flex-direction: column; gap: 16px; }
.${className}-item { display: flex; gap: 12px; }
.${className}-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--Primary, #FE353D); margin-top: 4px; }
.${className}-content { flex: 1; }
.${className}-title { font-weight: 500; display: block; }
.${className}-date { font-size: 12px; color: var(--On-Surface-Low); display: block; }
.${className}-amount { font-weight: 600; margin-top: 4px; display: block; }`,
      Dropdown: `.${className}-trigger { width: 100%; padding: 12px 16px; border: 1px solid #ddd; border-radius: 8px; background: #fff; }
.${className}-menu { margin-top: 4px; border: 1px solid #ddd; border-radius: 8px; background: #fff; }
.${className}-option { padding: 12px 16px; cursor: pointer; }
.${className}-option:hover { background: #f5f5f5; }`,
      Checkbox: `.${className} { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.${className}-box { width: 20px; height: 20px; border: 2px solid #ddd; border-radius: 4px; position: relative; }
.${className}-box::after { content: ''; position: absolute; top: 2px; left: 6px; width: 6px; height: 10px; border: solid #FE353D; border-width: 0 2px 2px 0; transform: rotate(45deg); opacity: 0; }
.${className} input:checked + .${className}-box::after { opacity: 1; }`,
      Radio: `.${className} { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.${className}-dot { width: 20px; height: 20px; border: 2px solid #ddd; border-radius: 50%; position: relative; }
.${className}-dot::after { content: ''; position: absolute; top: 3px; left: 3px; width: 12px; height: 12px; border-radius: 50%; background: var(--Primary, #FE353D); opacity: 0; }
.${className} input:checked + .${className}-dot::after { opacity: 1; }`,
      Toggle: `.${className} { position: relative; display: inline-block; width: 40px; height: 24px; }
.${className}-switch { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #ccc; border-radius: 24px; transition: .2s; }
.${className}-switch::before { position: absolute; content: ''; height: 20px; width: 20px; left: 2px; bottom: 2px; background: white; border-radius: 50%; transition: .2s; }
.${className} input:checked + .${className}-switch { background: var(--Primary, #FE353D); }
.${className} input:checked + .${className}-switch::before { transform: translateX(16px); }`
    };
    
    return cssMap[name] || `.${className} { /* Component styles */ }\n`;
  }

  toClassName(name) {
    return name.toLowerCase().replace(/([A-Z])/g, '-$1').substring(1);
  }

  saveComponent(componentSpec) {
    const generated = this.generateComponent(componentSpec);
    const category = generated.category;
    
    // Save to appropriate category folder
    const categoryPath = path.join(process.cwd(), 'components', category);
    if (!fs.existsSync(categoryPath)) {
      fs.mkdirSync(categoryPath, { recursive: true });
    }
    
    const fileName = this.toClassName(generated.name) + '.html';
    const filePath = path.join(categoryPath, fileName);
    
    fs.writeFileSync(filePath, `<!-- ${generated.name} Component -->
${generated.html}

<style>
${generated.css}
</style>`);
    
    // Update catalog
    this.updateCatalog(generated);
    
    return filePath;
  }

  updateCatalog(component) {
    if (!this.catalog.components[component.category]) {
      this.catalog.components[component.category] = [];
    }
    
    this.catalog.components[component.category].push({
      name: component.name,
      className: `.${this.toClassName(component.name)}`,
      file: `components/${component.category}/${this.toClassName(component.name)}.html`,
      variants: ['default'],
      props: {},
      description: component.description
    });
    
    fs.writeFileSync(
      path.join(process.cwd(), 'components', 'component-catalog.json'),
      JSON.stringify(this.catalog, null, 2)
    );
  }
}

// CLI export
if (import.meta.url === `file://${process.argv[1]}`) {
  const spec = JSON.parse(process.argv[2] || '{}');
  const generator = new ComponentGenerator();
  const result = generator.saveComponent(spec);
  console.log('Component saved to:', result);
}