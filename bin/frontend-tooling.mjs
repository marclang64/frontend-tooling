#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { initialize } from '../src/setup/initializer.mjs';

const usage =
    'Usage: frontend-tooling init [--javascript|--typescript] [--vanilla|--react] [--none|--css|--scss] [--yes]';
try {
    const { values, positionals } = parseArgs({
        allowPositionals: true,
        options: Object.fromEntries(
            [
                'javascript',
                'typescript',
                'vanilla',
                'react',
                'none',
                'css',
                'scss',
                'yes',
                'help',
            ].map((name) => [name, { type: 'boolean' }]),
        ),
    });
    if (values.help || !positionals.length) console.log(usage);
    else {
        if (positionals.length !== 1 || positionals[0] !== 'init') throw new Error(usage);
        const interactive = stdin.isTTY && stdout.isTTY && !values.yes;
        const rl = interactive ? createInterface({ input: stdin, output: stdout }) : null;
        async function choose(label, choices, fallback) {
            const selected = choices.filter((name) => values[name]);
            if (selected.length > 1) throw new Error(`Conflicting ${label} options.`);
            if (selected.length) return selected[0];
            if (!rl) return fallback;
            while (true) {
                const answer = (
                    await rl.question(`${label} (${choices.join('/')}) [${fallback}]: `)
                )
                    .trim()
                    .toLowerCase();
                if (!answer) return fallback;
                if (choices.includes(answer)) return answer;
                console.log('Invalid selection.');
            }
        }
        try {
            const language = await choose('Language', ['javascript', 'typescript'], 'javascript');
            const framework = await choose('Framework', ['vanilla', 'react'], 'vanilla');
            const styles = await choose('Styles', ['none', 'css', 'scss'], 'none');
            initialize(process.cwd(), { language, framework, styles });
        } finally {
            rl?.close();
        }
    }
} catch (error) {
    console.error(`[ERROR] ${error.message}`);
    process.exitCode = 1;
}
