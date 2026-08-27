#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptPath = fileURLToPath(import.meta.url)
const defaultRoot = path.resolve(path.dirname(scriptPath), '..')

const identityFields = [
  ['APP_VERSION', 'appVersion'],
  ['CHANGELOG[0].version', 'changelogVersion'],
  ['package.json.version', 'packageVersion'],
  ['package-lock root version', 'lockVersion'],
]

class UsageError extends Error {}

export function parseArgs(argv) {
  let strict = false
  let expectedVersion
  let root = defaultRoot

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]

    if (argument === '--strict') {
      strict = true
      continue
    }

    if (argument === '--expected' || argument === '--root') {
      const value = argv[index + 1]
      if (!value || value.startsWith('--')) throw new UsageError(`${argument} requires a value`)
      index += 1
      if (argument === '--expected') expectedVersion = value
      else root = path.resolve(process.cwd(), value)
      continue
    }

    if (argument.startsWith('--expected=')) {
      expectedVersion = argument.slice('--expected='.length)
      if (!expectedVersion) throw new UsageError('--expected requires a value')
      continue
    }

    if (argument.startsWith('--root=')) {
      const value = argument.slice('--root='.length)
      if (!value) throw new UsageError('--root requires a value')
      root = path.resolve(process.cwd(), value)
      continue
    }

    if (argument === '--help' || argument === '-h') return { help: true }
    throw new UsageError(`unknown argument: ${argument}`)
  }

  if (expectedVersion && !strict) throw new UsageError('--expected requires --strict')
  if (strict && !expectedVersion) throw new UsageError('--strict requires --expected X.Y.Z')

  return { help: false, strict, expectedVersion, root }
}

async function readJson(filePath, label) {
  let source
  try {
    source = await readFile(filePath, 'utf8')
  } catch (error) {
    throw new Error(`cannot read ${label}: ${error instanceof Error ? error.message : String(error)}`)
  }

  try {
    return JSON.parse(source)
  } catch (error) {
    throw new Error(`cannot parse ${label}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function requireVersion(value, label) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is missing or not a string`)
  return value.trim()
}

export function extractChangelogVersions(source) {
  const appVersionMatch = /\bexport\s+const\s+APP_VERSION\s*=\s*(['"])([^'"\r\n]+)\1/.exec(source)
  if (!appVersionMatch) throw new Error('APP_VERSION export is missing or unreadable')

  // Anchor the top-entry read to the exported array and its first object.
  const changelogStart = /\bexport\s+const\s+CHANGELOG(?:\s*:[^=]+)?\s*=\s*\[\s*\{/.exec(source)
  if (!changelogStart) throw new Error('CHANGELOG export or first entry is missing or unreadable')

  const firstEntry = source.slice(changelogStart.index + changelogStart[0].length)
  const changelogVersionMatch = /^\s*version\s*:\s*(['"])([^'"\r\n]+)\1/m.exec(firstEntry)
  if (!changelogVersionMatch) throw new Error('CHANGELOG[0].version is missing or unreadable')

  return {
    appVersion: requireVersion(appVersionMatch[2], 'APP_VERSION'),
    changelogVersion: requireVersion(changelogVersionMatch[2], 'CHANGELOG[0].version'),
  }
}

export async function readReleaseIdentity(root = defaultRoot) {
  const packageManifest = await readJson(path.join(root, 'package.json'), 'package.json')
  const lockfile = await readJson(path.join(root, 'package-lock.json'), 'package-lock.json')
  let changelogSource
  try {
    changelogSource = await readFile(path.join(root, 'src', 'data', 'changelog.ts'), 'utf8')
  } catch (error) {
    throw new Error(`cannot read src/data/changelog.ts: ${error instanceof Error ? error.message : String(error)}`)
  }

  const changelog = extractChangelogVersions(changelogSource)
  return {
    ...changelog,
    packageVersion: requireVersion(packageManifest?.version, 'package.json.version'),
    lockVersion: requireVersion(lockfile?.packages?.['']?.version, 'package-lock root version'),
  }
}

export function evaluateReleaseIdentity(identity, { strict = false, expectedVersion } = {}) {
  const internalMismatches = []
  if (identity.appVersion !== identity.changelogVersion) {
    internalMismatches.push(`APP_VERSION (${identity.appVersion}) does not match CHANGELOG[0].version (${identity.changelogVersion})`)
  }
  if (identity.packageVersion !== identity.lockVersion) {
    internalMismatches.push(`package.json.version (${identity.packageVersion}) does not match package-lock root version (${identity.lockVersion})`)
  }

  const strictReleaseCoherent = new Set(identityFields.map(([, key]) => identity[key])).size === 1
  const productPackageDrift = identity.appVersion !== identity.packageVersion
  const expectedMismatches = []

  if (strict) {
    for (const [label, key] of identityFields) {
      if (identity[key] !== expectedVersion) {
        expectedMismatches.push(`${label} (${identity[key]}) does not match expected release version (${expectedVersion})`)
      }
    }
  }

  const mismatches = [...internalMismatches, ...expectedMismatches]
  return {
    strictReleaseCoherent,
    productPackageDrift,
    internalMismatches,
    expectedMismatches,
    mismatches,
    ok: strict ? mismatches.length === 0 : internalMismatches.length === 0,
  }
}

export function formatReport(identity, evaluation, { strict = false, expectedVersion } = {}) {
  const lines = [
    `Release coherence report (${strict ? 'strict release-candidate' : 'development/report'} mode)`,
    `Product version (APP_VERSION): ${identity.appVersion}`,
    `Changelog top version: ${identity.changelogVersion}`,
    `Package mirror version: ${identity.packageVersion}`,
    `Lockfile mirror version: ${identity.lockVersion}`,
    `Strict release coherent: ${evaluation.strictReleaseCoherent}`,
  ]

  if (evaluation.productPackageDrift) {
    lines.push(`Product/package mirror drift: product ${identity.appVersion}; package mirror ${identity.packageVersion}`)
  }

  if (strict) {
    lines.push(`Expected release version: ${expectedVersion}`)
    if (evaluation.ok) lines.push('Result: PASS — strict release candidate is coherent')
    else {
      lines.push('Result: FAIL — strict release candidate is not coherent')
      lines.push(...evaluation.mismatches.map((message) => `- ${message}`))
    }
  } else if (evaluation.ok) {
    lines.push(evaluation.strictReleaseCoherent
      ? 'Result: PASS — development state is also release-coherent'
      : 'Result: REPORT ONLY — development state is not release-coherent by design')
    if (evaluation.internalMismatches.length > 0) lines.push(...evaluation.internalMismatches.map((message) => `- ${message}`))
  } else {
    lines.push('Result: FAIL — identity file pairs are internally inconsistent')
    lines.push(...evaluation.internalMismatches.map((message) => `- ${message}`))
  }

  return lines.join('\n')
}

export function usage() {
  return [
    'Usage:',
    '  npm run release:check',
    '  npm run release:check -- --strict --expected X.Y.Z',
    '  node scripts/release-check.mjs --root <repo-root> [--strict --expected X.Y.Z]',
  ].join('\n')
}

export async function runReleaseCheck(argv = process.argv.slice(2), output = console) {
  try {
    const options = parseArgs(argv)
    if (options.help) {
      output.log(usage())
      return 0
    }

    const identity = await readReleaseIdentity(options.root)
    const evaluation = evaluateReleaseIdentity(identity, options)
    output.log(formatReport(identity, evaluation, options))
    return evaluation.ok ? 0 : 1
  } catch (error) {
    output.error(`Release coherence check failed: ${error instanceof Error ? error.message : String(error)}`)
    output.error(usage())
    return 1
  }
}

if (path.resolve(process.argv[1] ?? '') === scriptPath) {
  process.exitCode = await runReleaseCheck()
}
