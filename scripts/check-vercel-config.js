// scripts/check-vercel-config.js
// Script pour vérifier la configuration Vercel Analytics
// Usage: node scripts/check-vercel-config.js

require('dotenv').config({ path: '.env.local' })

console.log('🔍 Vérification de la configuration Vercel Analytics\n')

const checks = {
  VERCEL_API_TOKEN: process.env.VERCEL_API_TOKEN,
  VERCEL_TEAM_ID: process.env.VERCEL_TEAM_ID,
  VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID,
}

let allGood = true

for (const [key, value] of Object.entries(checks)) {
  if (!value) {
    console.log(`❌ ${key} - MANQUANT`)
    allGood = false
  } else {
    // Masquer le token pour la sécurité
    const display =
      key === 'VERCEL_API_TOKEN'
        ? `${value.substring(0, 10)}...${value.substring(value.length - 4)}`
        : value
    console.log(`✅ ${key} - ${display}`)
  }
}

console.log('\n' + '='.repeat(50))

if (allGood) {
  console.log('✅ Configuration complète !')
  console.log("\nVous pouvez maintenant tester l'API:")
  console.log('curl http://localhost:3000/api/admin/analytics/vercel?period=7d')
} else {
  console.log('❌ Configuration incomplète')
  console.log('\nAjoutez les variables manquantes dans .env.local:')
  console.log(`
VERCEL_API_TOKEN=vercel_xxx...
VERCEL_TEAM_ID=sainthilaire-thomas-projects
VERCEL_PROJECT_ID=prj_xxx...
  `)
}

console.log('='.repeat(50) + '\n')
