import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { initialize } from '../../src/setup/initializer.mjs';

function fixture(t) {
    const root = mkdtempSync(join(tmpdir(), 'frontend-init-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    writeFileSync(join(root, 'package.json'), '{"name":"example"}\n');
    return root;
}
const options = { language: 'typescript', framework: 'react', styles: 'scss' };

test('creates project-specific configuration and is idempotent', (t) => {
    const root = fixture(t);
    initialize(root, options);
    const files = readdirSync(root);
    for (const name of [
        'eslint.config.mjs',
        'prettier.config.mjs',
        'tsconfig.json',
        'stylelint.config.mjs',
        '.editorconfig',
        '.gitignore',
        '.gitattributes',
        '.prettierignore',
    ])
        assert.ok(files.includes(name), name);
    const snapshot = files.map((name) => readFileSync(join(root, name), 'utf8'));
    initialize(root, options);
    assert.deepEqual(readdirSync(root), files);
    assert.deepEqual(
        files.map((name) => readFileSync(join(root, name), 'utf8')),
        snapshot,
    );
    assert.equal(
        JSON.parse(readFileSync(join(root, 'tsconfig.json'), 'utf8')).compilerOptions.jsx,
        'react-jsx',
    );
});

test('preserves existing configs and scripts and adds missing Git rules', (t) => {
    const root = fixture(t);
    writeFileSync(join(root, 'eslint.config.js'), '// custom\n');
    writeFileSync(join(root, 'package.json'), '{"scripts":{"lint":"custom"}}');
    writeFileSync(join(root, '.gitattributes'), '*.png binary\n* text=auto\n');
    initialize(root, options);
    assert.equal(readFileSync(join(root, 'eslint.config.js'), 'utf8'), '// custom\n');
    assert.ok(!readdirSync(root).includes('eslint.config.mjs'));
    assert.equal(
        JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).scripts.lint,
        'custom',
    );
    const rules = readFileSync(join(root, '.gitattributes'), 'utf8').split('\n');
    assert.ok(rules.includes('*.png binary'));
    assert.equal(rules.filter((line) => line === '* text=auto').length, 1);
});

test('all twelve project combinations generate appropriate configs', (t) => {
    for (const language of ['javascript', 'typescript'])
        for (const framework of ['vanilla', 'react'])
            for (const styles of ['none', 'css', 'scss']) {
                const root = fixture(t);
                initialize(root, { language, framework, styles });
                const files = readdirSync(root);
                assert.equal(files.includes('tsconfig.json'), language === 'typescript');
                assert.equal(files.includes('stylelint.config.mjs'), styles !== 'none');
                if (styles === 'css')
                    assert.match(
                        readFileSync(join(root, 'stylelint.config.mjs'), 'utf8'),
                        /stylelint\/css/,
                    );
            }
});
