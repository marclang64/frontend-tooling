import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { before, after, test } from 'node:test';

const projectRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));

let tempDir;

function runNpm(args, options = {}) {
    const npmCli = process.env.npm_execpath;

    if (!npmCli) {
        throw new Error('Run integration tests using npm.');
    }

    return spawnSync(process.execPath, [npmCli, ...args], {
        encoding: 'utf8',
        ...options,
    });
}

function runTool(command, args = []) {
    return runNpm(['exec', '--offline', '--yes=false', '--', command, ...args], {
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

function assertLintFailure(result, expectedRule) {
    assert.ifError(result.error);

    assert.equal(
        result.status,
        1,
        `Expected a lint violation:\n${result.stdout}\n${result.stderr}`,
    );

    const reports = JSON.parse(result.stdout);
    const messages = reports.flatMap((report) => report.messages);

    assert.ok(
        messages.some((message) => message.ruleId === expectedRule),
        `Expected rule violation: ${expectedRule}\n${result.stdout}`,
    );
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

    // Install only our package; no manual tool dependencies.
    const installResult = runNpm(['install', '--no-audit', '--no-fund', archivePath], {
        cwd: tempDir,
    });

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

test('ESLint accepts valid JavaScript React code', () => {
    writeTestFile(
        'eslint.config.mjs',
        `
import { base, react } from '@marclang64/frontend-tooling/eslint';

export default [...base, ...react];
`,
    );

    writeTestFile(
        'react-example.jsx',
        `
export function Greeting() {
    return <h1>Hello</h1>;
}
`,
    );

    assertSuccess(runTool('eslint', ['react-example.jsx']));
});

test('ESLint accepts valid TypeScript React code', () => {
    writeTestFile(
        'eslint.config.mjs',
        `
import { base, typescript, react } from '@marclang64/frontend-tooling/eslint';

export default [...base, ...typescript, ...react];
`,
    );

    writeTestFile(
        'react-example.tsx',
        `
type GreetingProps = {
    name: string;
};

export function Greeting({ name }: GreetingProps) {
    return <h1>Hello {name}</h1>;
}
`,
    );

    assertSuccess(runTool('eslint', ['react-example.tsx']));
});

test('ESLint detects React rule violations', () => {
    writeTestFile(
        'eslint.config.mjs',
        `
import { base, react } from '@marclang64/frontend-tooling/eslint';

export default [...base, ...react];
`,
    );

    writeTestFile(
        'react-invalid.jsx',
        `
export function Greeting() {
    return <div dangerouslySetInnerHTML={{ __html: 'Hello' }} />;
}
`,
    );

    const result = runTool('eslint', [
        'react-invalid.jsx',
        '--format',
        'json',
        '--max-warnings',
        '0',
    ]);

    assertLintFailure(result, '@eslint-react/dom-no-dangerously-set-innerhtml');
});

test('ESLint detects React Hooks rule violations', () => {
    writeTestFile(
        'eslint.config.mjs',
        `
import { base, react } from '@marclang64/frontend-tooling/eslint';

export default [...base, ...react];
`,
    );

    writeTestFile(
        'react-hooks-invalid.jsx',
        `
import { useState } from 'react';

export function Counter({ enabled }) {
    if (enabled) {
        useState(0);
    }

    return <div>Counter</div>;
}
`,
    );

    const result = runTool('eslint', ['react-hooks-invalid.jsx', '--format', 'json']);

    assertLintFailure(result, 'react-hooks/rules-of-hooks');
});

test('React rules are not applied to vanilla JavaScript', () => {
    writeTestFile(
        'eslint.config.mjs',
        `
import { base, react } from '@marclang64/frontend-tooling/eslint';

export default [...base, ...react];
`,
    );

    writeTestFile('vanilla-example.js', 'export const value = 42;\n');

    const result = runTool('eslint', ['--print-config', 'vanilla-example.js']);

    assertSuccess(result);

    const config = JSON.parse(result.stdout);

    const reactRules = Object.keys(config.rules).filter(
        (rule) => rule.startsWith('@eslint-react/') || rule.startsWith('react-hooks/'),
    );

    assert.deepEqual(reactRules, []);
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

test('installed CLI creates configuration and runs all generated scripts', () => {
    for (const file of [
        'eslint-example.js',
        'prettier-example.js',
        'typescript-example.ts',
        'stylelint-example.scss',
        'react-example.jsx',
        'react-example.tsx',
        'react-invalid.jsx',
        'react-hooks-invalid.jsx',
        'vanilla-example.js',
        'eslint.config.mjs',
        'prettier.config.mjs',
        'tsconfig.json',
        'stylelint.config.mjs',
    ])
        rmSync(join(tempDir, file), { force: true });
    assertSuccess(
        runTool('frontend-tooling', ['init', '--typescript', '--vanilla', '--scss', '--yes']),
    );
    writeTestFile('example.ts', 'export const value: number = 42;\n');
    writeTestFile('example.scss', '.card {\n    color: #fff;\n}\n');
    for (const script of ['format', 'format:check', 'lint', 'typecheck', 'stylelint'])
        assertSuccess(runNpm(['run', script], { cwd: tempDir }));
});
