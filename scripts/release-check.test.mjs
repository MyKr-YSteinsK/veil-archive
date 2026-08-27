import { spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const repositoryRoot = process.cwd()
const checkerPath = path.join(repositoryRoot, 'scripts', 'release-check.mjs')
let fixtureRoot

async function createFixture({ appVersion, changelogVersion, packageVersion, lockVersion }) {
  fixtureRoot = await mkdtemp(path.join(os.tmpdir(), 'veil-release-check-'))
  await mkdir(path.join(fixtureRoot, 'src', 'data'), { recursive: true })
  await writeFile(path.join(fixtureRoot, 'package.json'), JSON.stringify({ name: 'fixture', version: packageVersion }))
  await writeFile(path.join(fixtureRoot, 'package-lock.json'), JSON.stringify({
    name: 'fixture',
    version: lockVersion,
    lockfileVersion: 3,
    packages: { '': { name: 'fixture', version: lockVersion } },
  }))
  await writeFile(path.join(fixtureRoot, 'src', 'data', 'changelog.ts'), [
    `export const APP_VERSION = '${appVersion}'`,
    'export const CHANGELOG = [',
    `  { version: '${changelogVersion}', date: '2026-08-27', title: 'Fixture', items: [] },`,
    ']',
  ].join('\n'))
}

function runChecker(...arguments_) {
  const result = spawnSync(process.execPath, [checkerPath, '--root', fixtureRoot, ...arguments_], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  })
  return { status: result.status, output: `${result.stdout}${result.stderr}` }
}

afterEach(async () => {
  if (fixtureRoot) await rm(fixtureRoot, { recursive: true, force: true })
  fixtureRoot = undefined
})

describe('release coherence checker', () => {
  it('passes when runtime and package identity pairs are internally valid', async () => {
    await createFixture({ appVersion: '1.4.0', changelogVersion: '1.4.0', packageVersion: '1.4.0', lockVersion: '1.4.0' })

    const result = runChecker()

    expect(result.status).toBe(0)
    expect(result.output).toContain('Strict release coherent: true')
  })

  it('fails with a useful runtime/changelog mismatch diagnostic', async () => {
    await createFixture({ appVersion: '1.3.2', changelogVersion: '1.3.1', packageVersion: '1.0.0', lockVersion: '1.0.0' })

    const result = runChecker()

    expect(result.status).toBe(1)
    expect(result.output).toContain('APP_VERSION (1.3.2) does not match CHANGELOG[0].version (1.3.1)')
  })

  it('fails with a useful package/lock mismatch diagnostic', async () => {
    await createFixture({ appVersion: '1.3.1', changelogVersion: '1.3.1', packageVersion: '1.0.0', lockVersion: '1.0.1' })

    const result = runChecker()

    expect(result.status).toBe(1)
    expect(result.output).toContain('package.json.version (1.0.0) does not match package-lock root version (1.0.1)')
  })

  it('reports the known development package drift without failing', async () => {
    await createFixture({ appVersion: '1.3.1', changelogVersion: '1.3.1', packageVersion: '1.0.0', lockVersion: '1.0.0' })

    const result = runChecker()

    expect(result.status).toBe(0)
    expect(result.output).toContain('Product version (APP_VERSION): 1.3.1')
    expect(result.output).toContain('Package mirror version: 1.0.0')
    expect(result.output).toContain('Strict release coherent: false')
    expect(result.output).toContain('Result: REPORT ONLY — development state is not release-coherent by design')
  })

  it('fails strict mode for the current development drift', async () => {
    await createFixture({ appVersion: '1.3.1', changelogVersion: '1.3.1', packageVersion: '1.0.0', lockVersion: '1.0.0' })

    const result = runChecker('--strict', '--expected', '1.4.0')

    expect(result.status).toBe(1)
    expect(result.output).toContain('Result: FAIL — strict release candidate is not coherent')
    expect(result.output).toContain('APP_VERSION (1.3.1) does not match expected release version (1.4.0)')
    expect(result.output).toContain('package.json.version (1.0.0) does not match expected release version (1.4.0)')
  })

  it('passes strict mode for a coherent release fixture', async () => {
    await createFixture({ appVersion: '1.4.0', changelogVersion: '1.4.0', packageVersion: '1.4.0', lockVersion: '1.4.0' })

    const result = runChecker('--strict', '--expected', '1.4.0')

    expect(result.status).toBe(0)
    expect(result.output).toContain('Result: PASS — strict release candidate is coherent')
  })

  it('fails when the expected release version differs from otherwise coherent files', async () => {
    await createFixture({ appVersion: '1.4.0', changelogVersion: '1.4.0', packageVersion: '1.4.0', lockVersion: '1.4.0' })

    const result = runChecker('--strict', '--expected', '1.3.1')

    expect(result.status).toBe(1)
    expect(result.output).toContain('APP_VERSION (1.4.0) does not match expected release version (1.3.1)')
  })
})
