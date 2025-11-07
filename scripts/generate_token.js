const crypto = require('crypto');

function generateToken(bytes = 32){
  return crypto.randomBytes(bytes).toString('hex');
}

const token = generateToken(32);
console.log(token);

// Helpful note when running interactively
if (require.main === module) {
  console.error('\nCopy this token and store it securely (do NOT commit it).');
  console.error('Set it when starting the backend:');
  console.error('  PowerShell: $env:DASHBOARD_API_TOKEN = "<token>"; node server\\index.js');
  console.error('  Bash: DASHBOARD_API_TOKEN="<token>" node server/index.js');
}
