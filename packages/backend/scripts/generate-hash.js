#!/usr/bin/env node
/**
 * Utility script to generate bcrypt hashes for passphrases
 * Usage: node scripts/generate-hash.js <passphrase>
 */
const bcrypt = require('bcrypt');
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node scripts/generate-hash.js <passphrase>');
  console.log('Example: node scripts/generate-hash.js "mySecretPassphrase"');
  process.exit(1);
}
const passphrase = args[0];
const saltRounds = 10;
bcrypt.hash(passphrase, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  }
  console.log('\n✅ Generated hash for passphrase:');
  console.log('\nPassphrase:', passphrase);
  console.log('Hash:', hash);
  console.log('\nAdd this hash to your .env file in the GALLERY_SECTIONS variable');
  console.log('Example: GALLERY_SECTIONS=ceremony:' + hash);
  console.log('');
});
