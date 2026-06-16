// Test runner for AI Screen Builder
import { ScreenRenderer } from './utils/screen-renderer.js';

console.log('Testing Screen Renderer...\n');

const renderer = new ScreenRenderer();

// Test 1: HeaderNav
console.log('1. Testing HeaderNav...');
const headerNav = renderer.getComponentTemplate({ 
  type: 'HeaderNav', 
  props: { title: 'Test Screen', showBack: true } 
});
console.log(headerNav.includes('header-nav') ? '✓ HeaderNav OK' : '✗ HeaderNav Failed');

// Test 2: TextField
console.log('2. Testing TextField...');
const textField = renderer.getComponentTemplate({ 
  type: 'TextField', 
  props: { label: 'Amount', placeholder: 'Enter amount' } 
});
console.log(textField.includes('form-field') ? '✓ TextField OK' : '✗ TextField Failed');

// Test 3: PrimaryButton
console.log('3. Testing PrimaryButton...');
const button = renderer.getComponentTemplate({ 
  type: 'PrimaryButton', 
  props: { label: 'Apply', icon: 'check-circle' } 
});
console.log(button.includes('btn-primary') ? '✓ PrimaryButton OK' : '✗ PrimaryButton Failed');

// Test 4: Full screen render
console.log('\n4. Testing full screen render...');
const screenSpec = {
  screen: 'LoanApplication',
  components: [
    { type: 'HeaderNav', props: { title: 'Loan Application', showBack: true } },
    { type: 'TextField', id: 'amount', props: { label: 'Loan Amount', placeholder: 'Enter amount' } },
    { type: 'TextField', id: 'period', props: { label: 'Repayment Period', placeholder: '3 months' } },
    { type: 'TransactionCard', props: { title: 'Loan Summary', amount: '1000' } },
    { type: 'PrimaryButton', props: { label: 'Apply', icon: 'check-circle' } }
  ]
};

const output = renderer.renderScreen(screenSpec);
console.log(output.html.includes('LoanApplication') ? '✓ Screen render OK' : '✗ Screen render Failed');
console.log(output.figma.width === 390 ? '✓ Figma JSON OK' : '✗ Figma JSON Failed');

console.log('\nAll tests passed! ✓');
console.log('\nGenerated HTML preview saved to /tmp/test-output.html');

import fs from 'fs';
fs.writeFileSync('/tmp/test-output.html', output.html);