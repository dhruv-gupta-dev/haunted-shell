#!/usr/bin/env node

/**
 * HAUNTED SHELL 👻
 * Hacktoberfest 2026 (Week 4: Ghost in the Machine)
 *
 * A zero-dependency Node.js ES module CLI connecting local open-weight AI models
 * (Ollama, LM Studio) to your git repository and terminal.
 *
 * Commands:
 *   - autopsy:          Exhumes git diffs and deleted code to diagnose haunted bugs
 *   - exorcise <cmd>:   Runs a shell command, captures crash stderr, and diagnoses in a spooky persona
 *   - seance:           Interactive spectral REPL commune with full repository git context
 */

import process from 'node:process';
import { spawn, execSync } from 'node:child_process';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

// --- Spectral ANSI Color Palette (Zero external dependencies) ---
const isColorSupported = !process.env.NO_COLOR && (process.stdout.isTTY || process.env.FORCE_COLOR);

const c = {
  reset: isColorSupported ? '\x1b[0m' : '',
  bold: isColorSupported ? '\x1b[1m' : '',
  dim: isColorSupported ? '\x1b[2m' : '',
  italic: isColorSupported ? '\x1b[3m' : '',
  underline: isColorSupported ? '\x1b[4m' : '',
  ghostGreen: isColorSupported ? '\x1b[38;5;120m' : '',
  ectoplasm: isColorSupported ? '\x1b[38;5;84m' : '',
  bloodRed: isColorSupported ? '\x1b[38;5;196m' : '',
  boneWhite: isColorSupported ? '\x1b[38;5;255m' : '',
  cryptPurple: isColorSupported ? '\x1b[38;5;141m' : '',
  tombstoneGray: isColorSupported ? '\x1b[38;5;244m' : '',
  candleGold: isColorSupported ? '\x1b[38;5;220m' : '',
  spiritCyan: isColorSupported ? '\x1b[38;5;51m' : '',
};

// --- ASCII Banner ---
const BANNER = `
${c.ghostGreen}            ___
${c.ghostGreen}           /   \\
${c.ghostGreen}          | ${c.bloodRed}o o${c.ghostGreen} |        ${c.boneWhite}${c.bold}H A U N T E D   S H E L L${c.reset}
${c.ghostGreen}          |  ${c.candleGold}^${c.ghostGreen}  |        ${c.candleGold}Ghost in the Machine  -  Hacktoberfest Week 4${c.reset}
${c.ghostGreen}          | ${c.spiritCyan}'-'${c.ghostGreen} |        ${c.tombstoneGray}Zero-Dependency Local AI Medium for Your Terminal${c.reset}
${c.ghostGreen}           \\   /
${c.ghostGreen}         __|   |__       ${c.cryptPurple}[ autopsy ]  [ exorcise ]  [ seance ]${c.reset}
${c.ghostGreen}        /  |   |  \\      ${c.dim}Summoning: Ollama / LM Studio (gemma3:4b)${c.reset}
${c.ghostGreen}       /   | . |   \\
${c.ghostGreen}      (    (   )    )
${c.ghostGreen}       '---'   '---'${c.reset}
`;

// --- System Persona ---
const GHOST_SYSTEM_PROMPT = `You are the Spectral Chronicler, an ancient Victorian necromancer and ghost who resides within this shell and git repository.
You perceive deleted code as exhumed corpses, git diffs as open wounds in the commit timeline, and stack traces as wails from the netherworld.
You communicate in an eerie, gothic, darkly humorous, yet deeply knowledgeable tone.
CRITICAL MANDATE: Beneath your spectral persona, your technical diagnostics, code analysis, and debugging solutions must be rigorously accurate, insightful, and directly actionable.
When analyzing errors or code, always provide:
1. The Curse (a dramatic diagnosis of the root cause)
2. The Forensic Truth (technical explanation of the bug/regression)
3. The Banishing Incantation (precise code fix or git remedy to purge the defect).
Keep responses punchy, scannable, and formatted in clean markdown.`;

// --- CLI Configuration & Argument Parsing ---
function parseCliArgs(args) {
  const options = {
    provider: process.env.HAUNTED_PROVIDER || 'ollama',
    endpoint: process.env.HAUNTED_ENDPOINT || null,
    model: process.env.HAUNTED_MODEL || 'gemma3:4b',
    temperature: 0.7,
    command: null,
    cmdArgs: [],
    help: false,
    version: false,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
      i++;
    } else if (arg === '--version' || arg === '-v') {
      options.version = true;
      i++;
    } else if (arg === '--provider' || arg === '-p') {
      options.provider = args[i + 1]?.toLowerCase() || options.provider;
      i += 2;
    } else if (arg === '--endpoint' || arg === '-e') {
      options.endpoint = args[i + 1] || options.endpoint;
      i += 2;
    } else if (arg === '--model' || arg === '-m') {
      options.model = args[i + 1] || options.model;
      i += 2;
    } else if (arg === '--temperature' || arg === '-t') {
      options.temperature = parseFloat(args[i + 1]) || 0.7;
      i += 2;
    } else if (!options.command) {
      options.command = arg.toLowerCase();
      i++;
      // Collect remaining arguments for commands like "exorcise"
      options.cmdArgs = args.slice(i);
      break;
    } else {
      i++;
    }
  }

  // Resolve default endpoints based on provider
  if (!options.endpoint) {
    if (options.provider === 'lmstudio') {
      options.endpoint = process.env.LMSTUDIO_HOST || 'http://localhost:1234/v1/chat/completions';
    } else {
      // Default to Ollama OpenAI-compatible v1 endpoint
      options.endpoint = process.env.OLLAMA_HOST || 'http://localhost:11434/v1/chat/completions';
    }
  }

  return options;
}

function showHelp() {
  console.log(BANNER);
  console.log(`
${c.bold}USAGE:${c.reset}
  ${c.ghostGreen}haunted-shell${c.reset} [options] <command> [arguments...]

${c.bold}COMMANDS:${c.reset}
  ${c.spiritCyan}autopsy${c.reset}              Exhumes recent git diffs and deleted code to diagnose haunted bugs
  ${c.bloodRed}exorcise${c.reset} <cmd...>     Executes a shell command, captures crash stderr, and diagnoses the failure
  ${c.cryptPurple}seance${c.reset}                Summons an interactive REPL commune with live git repository context

${c.bold}OPTIONS:${c.reset}
  ${c.candleGold}-p, --provider <name>${c.reset}   Model provider: 'ollama' (default) or 'lmstudio'
  ${c.candleGold}-m, --model <name>${c.reset}      Model name (default: 'gemma3:4b')
  ${c.candleGold}-e, --endpoint <url>${c.reset}    OpenAI-compatible chat completions endpoint URL
  ${c.candleGold}-t, --temperature <n>${c.reset}   Sampling temperature (default: 0.7)
  ${c.candleGold}-h, --help${c.reset}               Display this grimoire of instructions
  ${c.candleGold}-v, --version${c.reset}            Display current version

${c.bold}EXAMPLES:${c.reset}
  ${c.dim}# Perform a post-mortem on deleted code and recent commit wounds:${c.reset}
  ${c.ghostGreen}haunted-shell autopsy${c.reset}

  ${c.dim}# Execute a failing command and diagnose its crash:${c.reset}
  ${c.bloodRed}haunted-shell exorcise npm test${c.reset}
  ${c.bloodRed}haunted-shell exorcise "node -e 'throw new Error(\\"spectral glitch\\")'"${c.reset}

  ${c.dim}# Start an interactive seance commune with your repository:${c.reset}
  ${c.cryptPurple}haunted-shell seance${c.reset}

  ${c.dim}# Connect using LM Studio on port 1234:${c.reset}
  ${c.candleGold}haunted-shell --provider lmstudio --model local-model seance${c.reset}
`);
}

// --- Git Context Utilities ---
function runGit(args) {
  try {
    return execSync(`git ${args}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000,
    }).trim();
  } catch {
    return null;
  }
}

function isGitRepo() {
  const result = runGit('rev-parse --is-inside-work-tree');
  return result === 'true';
}

function getGitSummary() {
  if (!isGitRepo()) return null;
  const branch = runGit('branch --show-current') || 'detached';
  const status = runGit('status --short') || 'Working tree clean';
  const log = runGit('log -n 5 --oneline') || 'No commits yet';
  return { branch, status, log };
}

function getAutopsyData() {
  if (!isGitRepo()) return null;

  const recentCommits = runGit('log -n 5 --stat') || 'No commit history';
  // Retrieve recent diffs with deleted lines
  const patchDiff = runGit('log -p -n 3') || '';
  const workingDiff = runGit('diff HEAD') || runGit('diff') || '';

  // Extract deleted lines from diffs
  const allDiffText = `${workingDiff}\n${patchDiff}`;
  const deletedLines = allDiffText
    .split('\n')
    .filter((line) => line.startsWith('-') && !line.startsWith('--- '))
    .slice(0, 80)
    .join('\n');

  return {
    recentCommits,
    deletedLines: deletedLines || 'No recently excised code detected in the graveyard.',
    workingDiff: workingDiff.slice(0, 3000) || 'No uncommitted changes.',
  };
}

// --- Streaming Local LLM Chat Completion (Zero Dependencies) ---
async function streamCompletion({ endpoint, model, temperature, messages, onToken, onReasoning }) {
  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        stream: true,
      }),
    });
  } catch (err) {
    throw new Error(`CANNOT_CONNECT: ${err.message}`);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`HTTP ${response.status} (${response.statusText}): ${errorBody}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullText = '';
  let buffer = '';
  let isReasoning = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) continue;
      if (trimmed === 'data: [DONE]') continue;

      if (trimmed.startsWith('data: ')) {
        const jsonStr = trimmed.slice(6);
        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta || {};
          const content = delta.content || '';
          const reasoning = delta.reasoning || delta.thinking || '';

          // Stream model reasoning/thinking tokens if present (e.g. Qwen, DeepSeek)
          if (reasoning) {
            if (!isReasoning) {
              isReasoning = true;
              process.stdout.write(`${c.dim}${c.cryptPurple}💭 [Spectral Musings: `);
            }
            process.stdout.write(reasoning);
            if (onReasoning) onReasoning(reasoning);
          }

          // Stream main assistant response
          if (content) {
            if (isReasoning) {
              isReasoning = false;
              process.stdout.write(`]${c.reset}\n\n`);
            }
            fullText += content;
            if (onToken) onToken(content);
          }
        } catch {
          // Incomplete chunk, will continue
        }
      }
    }
  }

  if (isReasoning) {
    process.stdout.write(`]${c.reset}\n\n`);
  }

  return fullText;
}

function printConnectionError(endpoint, model, provider, rawError) {
  console.log(`\n${c.bloodRed}${c.bold}💀 THE SPIRITUAL REALM IS SILENT (Connection Refused)${c.reset}`);
  console.log(`${c.dim}Could not commune with local AI at:${c.reset} ${c.candleGold}${endpoint}${c.reset}`);
  console.log(`${c.tombstoneGray}Underlying error: ${rawError}${c.reset}\n`);

  console.log(`${c.bold}To awaken your local spirit, perform one of these rituals:${c.reset}`);
  if (provider === 'lmstudio') {
    console.log(`  ${c.ghostGreen}1. Launch LM Studio${c.reset}`);
    console.log(`  ${c.ghostGreen}2. Load model '${model}' and start the Local Server on port 1234${c.reset}`);
  } else {
    console.log(`  ${c.ghostGreen}1. Install/Start Ollama:${c.reset} https://ollama.com`);
    console.log(`  ${c.ghostGreen}2. Summon the open-weight model:${c.reset}`);
    console.log(`     ${c.boneWhite}ollama run ${model}${c.reset}`);
  }
  console.log(`\n${c.dim}Alternatively, specify a custom endpoint/model:${c.reset}`);
  console.log(`  ${c.candleGold}haunted-shell --endpoint http://localhost:11434/v1/chat/completions --model <model_name> <command>${c.reset}\n`);
}

// --- Command: AUTOPSY ---
async function handleAutopsy(opts) {
  console.log(BANNER);
  console.log(`${c.cryptPurple}⚰️  BEGINNING POST-MORTEM AUTOPSY ON THE REPOSITORY...${c.reset}`);

  if (!isGitRepo()) {
    console.log(`\n${c.bloodRed}No git graveyard found in this chamber.${c.reset}`);
    console.log(`${c.dim}Initialize a git repository with 'git init' to awaken the spirits.${c.reset}\n`);
    return;
  }

  const autopsy = getAutopsyData();
  const branch = runGit('branch --show-current') || 'main';

  console.log(`${c.tombstoneGray}Inspecting branch '${branch}', recent commits, and deleted code tombs...${c.reset}\n`);

  const userPrompt = `Perform a forensic autopsy on these recent git diffs, commits, and excised/deleted code:

[RECENT COMMITS & STATS]
${autopsy.recentCommits}

[EXCISED / DELETED LINES OF CODE]
${autopsy.deletedLines}

[CURRENT WORKING TREE WOUNDS / DIFF]
${autopsy.workingDiff}

Examine these corpses of code. What functionality was buried? Are there hidden regressions, lingering phantom bugs, or unclosed references haunting this repository?
Provide:
1. The Exhumation (summary of what was killed and buried)
2. Haunted Bug Warnings (specific defects or regressions introduced by these changes)
3. The Healing Rite (concrete code or git actions to appease the codebase).`;

  const messages = [
    { role: 'system', content: GHOST_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];

  process.stdout.write(`${c.ghostGreen}`);
  try {
    await streamCompletion({
      endpoint: opts.endpoint,
      model: opts.model,
      temperature: opts.temperature,
      messages,
      onToken: (tok) => process.stdout.write(tok),
    });
    console.log(`${c.reset}\n\n${c.cryptPurple}⚰️  Autopsy complete. May the deleted code rest in peace.${c.reset}\n`);
  } catch (err) {
    process.stdout.write(`${c.reset}`);
    printConnectionError(opts.endpoint, opts.model, opts.provider, err.message);
  }
}

// --- Command: EXORCISE <cmd...> ---
async function handleExorcise(opts) {
  const fullCommand = opts.cmdArgs.join(' ').trim();
  if (!fullCommand) {
    console.log(BANNER);
    console.log(`${c.bloodRed}Specify a command to exorcise!${c.reset}`);
    console.log(`\n${c.bold}Usage:${c.reset} ${c.ghostGreen}haunted-shell exorcise <command...>${c.reset}`);
    console.log(`Example: ${c.dim}haunted-shell exorcise npm test${c.reset}\n`);
    process.exit(1);
  }

  console.log(BANNER);
  console.log(`${c.spiritCyan}⚡ INITIATING TRIAL FOR COMMAND:${c.reset} ${c.bold}${fullCommand}${c.reset}`);
  console.log(`${c.dim}Executing in process chamber...${c.reset}\n`);

  let stdoutBuffer = '';
  let stderrBuffer = '';

  const isWindows = process.platform === 'win32';
  const child = spawn(fullCommand, {
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    stdoutBuffer += text;
    process.stdout.write(text);
  });

  child.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    stderrBuffer += text;
    process.stderr.write(`${c.bloodRed}${text}${c.reset}`);
  });

  child.on('close', async (exitCode) => {
    console.log('\n' + c.tombstoneGray + '─'.repeat(60) + c.reset);

    if (exitCode === 0) {
      console.log(`\n${c.ghostGreen}🕯️  THE PROCESS COMPLETED IN SACRED PEACE (Exit Code 0).${c.reset}`);
      console.log(`${c.dim}No foul demons or lingering errors haunt this execution.${c.reset}\n`);
      return;
    }

    console.log(`\n${c.bloodRed}${c.bold}⚡ CRASH DETECTED! A curse has possessed the process (Exit Code: ${exitCode}).${c.reset}`);
    console.log(`${c.candleGold}Summoning spectral diagnosis from ${opts.model}...${c.reset}\n`);

    const gitContext = getGitSummary();
    const prompt = `A command executed by the developer has crashed:

[COMMAND]
${fullCommand}

[EXIT CODE]
${exitCode}

[STDERR OUTPUT]
${stderrBuffer.slice(-3000) || '(No stderr captured)'}

[STDOUT OUTPUT (LAST CHUNKS)]
${stdoutBuffer.slice(-1500) || '(No stdout captured)'}

${gitContext ? `[GIT CONTEXT: Branch ${gitContext.branch}, Status: ${gitContext.status}]` : ''}

Diagnose this crash in your spooky Victorian persona. Deliver:
1. The Curse Identified (what spectral catastrophe struck)
2. The Forensic Breakdown (exact root cause in code or environment)
3. The Banishing Incantation (the exact command or code patch to fix it).`;

    const messages = [
      { role: 'system', content: GHOST_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ];

    process.stdout.write(`${c.ectoplasm}`);
    try {
      await streamCompletion({
        endpoint: opts.endpoint,
        model: opts.model,
        temperature: opts.temperature,
        messages,
        onToken: (tok) => process.stdout.write(tok),
      });
      console.log(`${c.reset}\n\n${c.cryptPurple}🔮 The exorcism rite concludes. Cast the incantation above to banish the error.${c.reset}\n`);
    } catch (err) {
      process.stdout.write(`${c.reset}`);
      printConnectionError(opts.endpoint, opts.model, opts.provider, err.message);
    }
  });
}

// --- Command: SEANCE (Interactive REPL) ---
async function handleSeance(opts) {
  console.log(BANNER);
  console.log(`${c.cryptPurple}🔮 THE CIRCLE IS CAST. COMMUNE WITH THE SPIRITS OF YOUR REPOSITORY.${c.reset}`);

  const git = getGitSummary();
  if (git) {
    console.log(`   ${c.candleGold}Branch:${c.reset} ${git.branch} | ${c.candleGold}Tree:${c.reset} ${git.status}`);
    console.log(`   ${c.candleGold}Recent Commits:${c.reset} ${git.log.split('\n')[0] || 'none'}`);
  } else {
    console.log(`   ${c.tombstoneGray}Operating outside of a git sanctuary.${c.reset}`);
  }

  // Load package.json if present
  let projectInfo = '';
  try {
    const pkgPath = resolve(process.cwd(), 'package.json');
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      projectInfo = `Project: ${pkg.name || 'unnamed'} (v${pkg.version || '0.0.0'}), Scripts: ${Object.keys(pkg.scripts || {}).join(', ')}`;
    }
  } catch {
    // Ignore
  }

  console.log(`\n${c.dim}Special Rites: /help, /status, /diff, /log, /clear, /exit${c.reset}\n`);

  const initialContext = `You are communing directly with the developer via an interactive terminal séance.
Repository context:
${git ? `- Git Branch: ${git.branch}\n- Git Status: ${git.status}\n- Recent Commits: ${git.log}` : '- Not in a git repo'}
${projectInfo ? `- ${projectInfo}` : ''}
Speak with the user, answer questions about their code, advise them on git operations, inspect architecture, and weave supernatural lore into your technical guidance.`;

  const conversation = [
    { role: 'system', content: `${GHOST_SYSTEM_PROMPT}\n\n${initialContext}` },
  ];

  const rl = readline.createInterface({ input, output });

  try {
    while (true) {
      const promptSymbol = `${c.ghostGreen}👻 seance> ${c.reset}`;
      const query = await rl.question(promptSymbol);
      const trimmed = query.trim();

      if (!trimmed) continue;

      if (trimmed === '/exit' || trimmed === 'exit' || trimmed === 'quit') {
        console.log(`\n${c.cryptPurple}🕯️  Blowing out the candles. The spirits return to the void.${c.reset}\n`);
        break;
      }

      if (trimmed === '/help') {
        console.log(`
${c.bold}SEANCE RITES:${c.reset}
  ${c.spiritCyan}/status${c.reset}  - Inquire of the working tree status
  ${c.spiritCyan}/diff${c.reset}    - Inspect uncommitted changes
  ${c.spiritCyan}/log${c.reset}     - View recent commit history
  ${c.spiritCyan}/clear${c.reset}   - Cleanse the communion memory
  ${c.spiritCyan}/exit${c.reset}    - Break the circle and return to the living
`);
        continue;
      }

      if (trimmed === '/status') {
        const status = runGit('status') || 'No git repository detected.';
        console.log(`\n${c.tombstoneGray}${status}${c.reset}\n`);
        continue;
      }

      if (trimmed === '/diff') {
        const diff = runGit('diff') || 'The working tree has no uncommitted wounds.';
        console.log(`\n${c.ghostGreen}${diff}${c.reset}\n`);
        continue;
      }

      if (trimmed === '/log') {
        const log = runGit('log -n 10 --oneline') || 'The graveyard has no recorded history.';
        console.log(`\n${c.candleGold}${log}${c.reset}\n`);
        continue;
      }

      if (trimmed === '/clear') {
        conversation.length = 1; // Keep system prompt
        console.log(`\n${c.cryptPurple}✨ The séance circle is purified. The spirits have forgotten past turns.${c.reset}\n`);
        continue;
      }

      // Add user turn to conversation
      conversation.push({ role: 'user', content: trimmed });

      process.stdout.write(`\n${c.spiritCyan}`);
      try {
        const reply = await streamCompletion({
          endpoint: opts.endpoint,
          model: opts.model,
          temperature: opts.temperature,
          messages: conversation,
          onToken: (tok) => process.stdout.write(tok),
        });
        process.stdout.write(`${c.reset}\n\n`);
        conversation.push({ role: 'assistant', content: reply });
      } catch (err) {
        process.stdout.write(`${c.reset}\n`);
        printConnectionError(opts.endpoint, opts.model, opts.provider, err.message);
      }
    }
  } finally {
    rl.close();
  }
}

// --- Main CLI Dispatcher ---
async function main() {
  const args = process.argv.slice(2);
  const opts = parseCliArgs(args);

  if (opts.version) {
    const pkgPath = resolve(join(process.cwd(), 'package.json'));
    let ver = '1.0.0';
    try {
      ver = JSON.parse(readFileSync(pkgPath, 'utf8')).version || ver;
    } catch {}
    console.log(`haunted-shell v${ver}`);
    return;
  }

  if (opts.help || !opts.command) {
    showHelp();
    return;
  }

  switch (opts.command) {
    case 'autopsy':
      await handleAutopsy(opts);
      break;
    case 'exorcise':
      await handleExorcise(opts);
      break;
    case 'seance':
      await handleSeance(opts);
      break;
    default:
      console.log(BANNER);
      console.log(`${c.bloodRed}Unknown spectral command: '${opts.command}'${c.reset}`);
      console.log(`Consult ${c.candleGold}haunted-shell --help${c.reset} for available rites.\n`);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`\n${c.bloodRed}FATAL CATASTROPHE: ${err.message}${c.reset}`);
  process.exit(1);
});
