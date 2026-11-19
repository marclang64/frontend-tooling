import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { before, after, test } from 'node:test';

const projectRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const npmCli = resolve(projectRoot, 'node_modules/npm/bin/npm-cli.js');

let tempDir;

function runNpm(args, options = {}) {
    return spawnSync(process.execPath, [npmCli, ...args], {
        encoding: 'utf8',
        ...options,
    });
}

function runTool(command, args = []) {
    return runNpm(['exec', '--', command, ...args], {
        cwd: tempDir,
    });
}

function writeTestFile(filename, content) {
    writeFileSync(join(tempDir, filename), content);
}

function assertSuccess(result) {
    assert.ifError(result.error);

    assert.equal(result.status, 0, `Expected success:\n${result.stdout}\n${result.stderr}`);
}

function assertFailure(result, expectedMessage) {
    assert.ifError(result.error);

    assert.notEqual(
        result.status,
        0,
        `Expected a validation error:\n${result.stdout}\n${result.stderr}`,
    );

    assert.notEqual(result.status, null, `Process terminated unexpectedly:\n${result.stderr}`);

    assert.match(`${result.stdout}\n${result.stderr}`, expectedMessage);
}

// Prepare one independent consumer project for all tests.
before(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'frontend-tooling-'));

    // Build the npm package.
    const packResult = runNpm(['pack', '--pack-destination', tempDir, '--silent'], {
        cwd: projectRoot,
    });

    assertSuccess(packResult);

    const archiveName = packResult.stdout.trim();
    const archivePath = join(tempDir, archiveName);

    // Create an independent project.
    writeTestFile(
        'package.json',
        JSON.stringify({
            private: true,
            type: 'module',
        }),
    );

    // Install our package and its peer tools.
    const installResult = runNpm(
        [
            'install',
            '--no-audit',
            '--no-fund',
            archivePath,
            'eslint@^9',
            'prettier@^3',
            'typescript@^6',
            'stylelint@^18',
        ],
        { cwd: tempDir },
    );

    assertSuccess(installResult);
});

// Remove the temporary project after all tests.
after(() => {
    if (tempDir) {
        rmSync(tempDir, {
            recursive: true,
            force: true,
        });
    }
});

test('ESLint configuration detects rule violations', () => {
    writeTestFile(
        'eslint.config.mjs',
        `
import { base } from '@marclang64/frontend-tooling/eslint';

export default [...base];
`,
    );

    writeTestFile('eslint-example.js', 'debugger;\n');

    const result = runTool('eslint', ['eslint-example.js']);

    assertFailure(result, /no-debugger/);
});

test('Prettier configuration formats code correctly', () => {
    writeTestFile(
        'prettier.config.mjs',
        `
export { default } from '@marclang64/frontend-tooling/prettier';
`,
    );

    writeTestFile('prettier-example.js', 'const greet=(name)=>{return "Hello, "+name}\n');

    const result = runTool('prettier', ['--write', 'prettier-example.js']);

    assertSuccess(result);

    const formatted = readFileSync(join(tempDir, 'prettier-example.js'), 'utf8');

    assert.equal(formatted, "const greet = (name) => {\n    return 'Hello, ' + name;\n};\n");
});

test('TypeScript configuration detects type errors', () => {
    writeTestFile(
        'tsconfig.json',
        JSON.stringify({
            extends: '@marclang64/frontend-tooling/typescript',
            compilerOptions: {
                lib: ['ES2022', 'DOM'],
            },
            include: ['typescript-example.ts'],
        }),
    );

    writeTestFile(
        'typescript-example.ts',
        `
function greet(name: string): string {
    return \`Hello, \${name}\`;
}

console.log(greet(42));
`,
    );

    const result = runTool('tsc', ['--noEmit']);

    assertFailure(result, /TS2345/);
});

test('Stylelint configuration detects rule violations', () => {
    writeTestFile(
        'stylelint.config.mjs',
        `
export { default } from '@marclang64/frontend-tooling/stylelint';
`,
    );

    writeTestFile(
        'stylelint-example.scss',
        `
.card {
    color: red !important;
}
`,
    );

    const result = runTool('stylelint', ['stylelint-example.scss']);

    assertFailure(result, /declaration-no-important/);
});
