import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const packageName = '@marclang64/frontend-tooling';
const ignore = [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.tgz',
    '*.tsbuildinfo',
    '.env',
    '.env.local',
    '.env.*.local',
    '*.log',
];
const attributes = [
    '* text=auto',
    ...['js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx', 'css', 'scss', 'json'].map(
        (ext) => `*.${ext} text eol=lf`,
    ),
];

function create(root, name, content, alternatives = []) {
    if ([name, ...alternatives].some((file) => existsSync(join(root, file)))) {
        console.log(`[SKIP] ${name}: configuration already exists`);
        return;
    }
    writeFileSync(join(root, name), content, { flag: 'wx' });
    console.log(`[OK] Created ${name}`);
}

function appendRules(root, name, rules) {
    const path = join(root, name);
    const original = existsSync(path) ? readFileSync(path, 'utf8') : '';
    const lines = original.split(/\r?\n/);
    const missing = rules.filter((rule) => !lines.includes(rule));
    if (!missing.length) return;
    const separator = original && !original.endsWith('\n') ? '\n\n' : original ? '\n' : '';
    writeFileSync(path, `${original}${separator}# Frontend Tooling\n${missing.join('\n')}\n`);
    console.log(`[OK] Updated ${name}`);
}

export function initialize(root, { language, framework, styles }) {
    if (
        !['javascript', 'typescript'].includes(language) ||
        !['vanilla', 'react'].includes(framework) ||
        !['none', 'css', 'scss'].includes(styles)
    ) {
        throw new Error('Invalid project options.');
    }
    const path = join(root, 'package.json');
    const original = readFileSync(path, 'utf8');
    const pkg = JSON.parse(original);
    if (!pkg || typeof pkg !== 'object' || Array.isArray(pkg))
        throw new Error('package.json must be an object.');
    if (
        pkg.scripts !== undefined &&
        (!pkg.scripts || typeof pkg.scripts !== 'object' || Array.isArray(pkg.scripts))
    )
        throw new Error('package.json scripts must be an object.');
    const ts = language === 'typescript';
    const react = framework === 'react';
    const configs = ['base', ...(ts ? ['typescript'] : []), ...(react ? ['react'] : [])];
    const eslint = `import { ${configs.join(', ')} } from '${packageName}/eslint';\nimport { browser, node, prettier } from '${packageName}/eslint/environment';\n\nexport default [\n    { ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/coverage/**'] },\n    ${configs.map((name) => `...${name}`).join(',\n    ')},\n    { files: ['**/*.{js,jsx,ts,tsx}'], languageOptions: { globals: browser } },\n    { files: ['**/*.config.{js,mjs,cjs,ts}', '**/scripts/**/*.{js,mjs,cjs,ts}'], languageOptions: { globals: node } },\n    prettier,\n];\n`;
    create(root, 'eslint.config.mjs', eslint, [
        'eslint.config.js',
        'eslint.config.cjs',
        'eslint.config.ts',
        'eslint.config.mts',
        'eslint.config.cts',
        '.eslintrc',
        '.eslintrc.json',
        '.eslintrc.js',
        '.eslintrc.cjs',
        '.eslintrc.yml',
        '.eslintrc.yaml',
        ...(pkg.eslintConfig ? ['package.json'] : []),
    ]);
    create(root, 'prettier.config.mjs', `export { default } from '${packageName}/prettier';\n`, [
        '.prettierrc',
        '.prettierrc.json',
        '.prettierrc.yml',
        '.prettierrc.yaml',
        '.prettierrc.json5',
        '.prettierrc.toml',
        '.prettierrc.js',
        '.prettierrc.cjs',
        '.prettierrc.mjs',
        'prettier.config.js',
        'prettier.config.cjs',
        'prettier.config.ts',
        'prettier.config.mts',
        'prettier.config.cts',
        '.prettierrc.ts',
        '.prettierrc.mts',
        '.prettierrc.cts',
        ...(pkg.prettier !== undefined ? ['package.json'] : []),
    ]);
    if (ts)
        create(
            root,
            'tsconfig.json',
            JSON.stringify(
                {
                    extends: `${packageName}/typescript`,
                    compilerOptions: {
                        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
                        ...(react ? { jsx: 'react-jsx' } : {}),
                    },
                    include: ['**/*.ts', ...(react ? ['**/*.tsx'] : [])],
                    exclude: ['node_modules', 'dist', 'build', 'coverage'],
                },
                null,
                4,
            ) + '\n',
        );
    if (styles !== 'none')
        create(
            root,
            'stylelint.config.mjs',
            `export { default } from '${packageName}/stylelint${styles === 'css' ? '/css' : ''}';\n`,
            [
                'stylelint.config.js',
                'stylelint.config.cjs',
                'stylelint.config.ts',
                'stylelint.config.mts',
                'stylelint.config.cts',
                '.stylelintrc',
                '.stylelintrc.json',
                '.stylelintrc.yml',
                '.stylelintrc.yaml',
                '.stylelintrc.js',
                '.stylelintrc.cjs',
                '.stylelintrc.mjs',
                ...(pkg.stylelint ? ['package.json'] : []),
            ],
        );
    create(
        root,
        '.editorconfig',
        'root = true\n\n[*]\ncharset = utf-8\nend_of_line = lf\ninsert_final_newline = true\nindent_style = space\nindent_size = 4\ntrim_trailing_whitespace = true\n\n[*.md]\ntrim_trailing_whitespace = false\n',
    );
    appendRules(root, '.gitignore', ignore);
    appendRules(root, '.gitattributes', attributes);
    appendRules(root, '.prettierignore', [
        'node_modules/',
        'dist/',
        'build/',
        'coverage/',
        'package-lock.json',
        '*.tgz',
    ]);
    const scripts = {
        lint: 'eslint .',
        'lint:fix': 'eslint . --fix',
        format: 'prettier --write .',
        'format:check': 'prettier --check .',
        ...(ts ? { typecheck: 'tsc --noEmit' } : {}),
        ...(styles !== 'none'
            ? {
                  stylelint: `stylelint "**/*.${styles === 'scss' ? '{css,scss}' : 'css'}" --allow-empty-input`,
                  'stylelint:fix': `stylelint "**/*.${styles === 'scss' ? '{css,scss}' : 'css'}" --allow-empty-input --fix`,
              }
            : {}),
    };
    const before = JSON.stringify(pkg);
    pkg.scripts ??= {};
    for (const [name, command] of Object.entries(scripts))
        if (!Object.hasOwn(pkg.scripts, name)) pkg.scripts[name] = command;
    if (JSON.stringify(pkg) !== before) writeFileSync(path, JSON.stringify(pkg, null, 4) + '\n');
    console.log('Frontend Tooling initialized.');
}
