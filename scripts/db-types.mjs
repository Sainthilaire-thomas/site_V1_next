// scripts/db-types.mjs
import { execSync } from 'node:child_process'

const isCI = !!process.env.CI || !!process.env.VERCEL
const force = process.env.FORCE_DB_TYPES === '1'

if (isCI && !force) {
  console.log('CI detected → skipping Supabase types generation.')
  process.exit(0)
}

const projectId = process.env.SUPABASE_PROJECT_ID || 'lnkxfyfkwnfvxvaxnbah'
if (!projectId) {
  console.error('Missing SUPABASE_PROJECT_ID.')
  process.exit(1)
}

const tokenArg = process.env.SUPABASE_ACCESS_TOKEN
  ? ` --token ${process.env.SUPABASE_ACCESS_TOKEN}`
  : ''

const outPath = 'src/lib/database.types.ts'
const cmd = `npx supabase gen types typescript --project-id ${projectId}${tokenArg} --schema public > ${outPath}`

console.log('Generating Supabase types:', cmd)
execSync(cmd, { stdio: 'inherit', env: process.env })
console.log('Types written to', outPath)
