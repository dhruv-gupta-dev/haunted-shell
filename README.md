# 👻 Haunted Shell

> **Ghost in the Machine • Hacktoberfest 2026 (Week 4 DEV Challenge)**  
> *A zero-dependency Node.js ES module CLI connecting local open-weight AI models to your git repository and terminal.*

[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest-2026_Week_4-orange?style=for-the-badge&logo=hacktoberfest)](https://dev.to/challenges/hf26)
[![Challenge Theme](https://img.shields.io/badge/Theme-Ghost_in_the_Machine-purple?style=for-the-badge)](https://dev.to/challenges/hf26)
[![Node.js](https://img.shields.io/badge/Node.js-24%2B_LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0_Zero-007acc?style=for-the-badge)](package.json)
[![Local AI](https://img.shields.io/badge/Local_AI-Gemma_3_%7C_Ollama_%7C_LM_Studio-e05d44?style=for-the-badge)](https://ollama.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

```text
             .-.
            /   \          H A U N T E D   S H E L L
           /     \         Ghost in the Machine • Hacktoberfest Week 4
          | () () |        Zero-Dependency Local AI Medium for Your Terminal
          |   ^   |
          \  '='  /        [ autopsy ]  •  [ exorcise ]  •  [ seance ]
          /`-----'`\        Summoning: Ollama / LM Studio (gemma3:4b)
         / |     | \
        /  |  .  |  \
       (   (  .  )   )
        '---' '---'
```

---

## 🕯️ The Lore: Ghost in the Machine

Every git repository is a digital graveyard. 

Behind every `main` branch lie buried functions, excised logic, hasty hotfixes, and broken promises commemorated in cryptic commit messages. When builds break and commands crash, those buried spirits wail through unholy stack traces.

**Haunted Shell** awakens the **Spectral Chronicler**—a Victorian necromancer and medium inhabiting your terminal. Powered by local open-weight models (**Google Gemma 3**, **Qwen**, or any model running locally in **Ollama** or **LM Studio**), it turns mundane git forensics and crash debugging into a chilling, delightfully gothic séance while delivering razor-sharp, actionable technical solutions.

---

## 🔮 Three Spectral Rites

```text
┌─────────────────┬────────────────────────────────────────────────────────┐
│ Command         │ Purpose                                                │
├─────────────────┼────────────────────────────────────────────────────────┤
│ autopsy         │ Exhumes deleted code & diffs to find haunted bugs      │
│ exorcise <cmd>  │ Executes a command, catches stderr, diagnoses crashes │
│ seance          │ Interactive REPL commune with full git repository repo │
└─────────────────┴────────────────────────────────────────────────────────┘
```

### 1. `autopsy` — Exhuming the Commit Graveyard
Scans your git commit history, unearths excised lines (`-` diffs), inspects working tree wounds, and conducts a forensic post-mortem:
* **The Exhumation**: An accounting of what functionality was killed and buried.
* **Haunted Bug Warnings**: Latent regressions, phantom references, or architectural debt.
* **The Healing Rite**: Practical git commands and code fixes to restore balance.

```bash
haunted-shell autopsy
```

### 2. `exorcise <command...>` — Process Chamber Trial
Runs any shell command inside an isolated execution chamber and captures real-time outputs.
* If the command succeeds (`exit code 0`): confirms the process was purified with no demons remaining.
* If the command crashes (`exit code != 0`): captures `stderr`, analyzes the stack trace, and invokes the local model:
  * **The Curse Identified**: What evil brought down the process.
  * **The Forensic Breakdown**: Exact root cause in your runtime or code.
  * **The Banishing Incantation**: The exact code patch or shell command to banish the error.

```bash
haunted-shell exorcise npm test
haunted-shell exorcise "node app.js"
haunted-shell exorcise cargo build
```

### 3. `seance` — Interactive Git REPL
Summons an interactive, multi-turn communion circle in your terminal with live repository awareness:
* Automatically loads current **git branch**, **working tree status**, **recent commits**, and **`package.json` scripts**.
* Maintains conversational memory across questions.
* Includes built-in spectral shortcut rites:
  * `/status` — Inquire into the state of the living tree.
  * `/diff` — Inspect uncommitted wounds.
  * `/log` — Review the graveyard of past commits.
  * `/clear` — Purify memory and restart the circle.
  * `/exit` — Break the circle and return to the living.

```bash
haunted-shell seance
```

---

## ⚡ Zero-Dependency Architecture

Built exclusively using modern **Node.js 24 LTS native capabilities**—no external packages, no bloated `node_modules`, no security vulnerabilities.

```mermaid
flowchart TD
    subgraph Terminal ["🖥️ Developer Terminal"]
        User["Developer"] -->|Command| CLI["haunted-shell (Node.js ES Module)"]
    end

    subgraph NativeNode ["⚙️ Native Node.js Built-ins (0 Dependencies)"]
        CLI --> NativeProc["node:child_process (spawn, execSync)"]
        CLI --> NativeRL["node:readline/promises (Interactive REPL)"]
        CLI --> NativeFetch["Global fetch + SSE Stream Reader"]
        CLI --> NativeColors["ANSI Spectral Palette (NO_COLOR safe)"]
    end

    subgraph GitTree ["📁 Local Git Repository"]
        NativeProc --> GitLog["git log -p (Deleted Code & Diffs)"]
        NativeProc --> GitStatus["git status & branch"]
        NativeProc --> ProcessChamber["Process Execution & Stderr Trap"]
    end

    subgraph LocalAI ["🧠 100% Offline Open-Weight Inference"]
        NativeFetch -->|/v1/chat/completions (OpenAI compatible)| Engine{"Local AI Provider"}
        Engine -->|Port 11434| Ollama["Ollama (gemma3:4b / qwen3:4b)"]
        Engine -->|Port 1234| LMStudio["LM Studio"]
    end
```

---

## 📜 Why Open-Source & Open-Weight AI Matters

This project was built for the **Hacktoberfest 2026: Week 4 Challenge (Ghost in the Machine)** under the `#hf26challenge` tag.

When diagnosing crashes or inspecting git diffs, your repository contains private code, intellectual property, internal paths, and sometimes sensitive tokens. By relying strictly on local open-weight models (**Gemma 3:4b**, **Qwen 3:4b**, etc.):

1. **Absolute Privacy**: Code diffs and crash traces never leave `localhost`.
2. **Offline Resilience**: Works without internet access (in trains, planes, or off-grid cabins).
3. **Zero API Subscriptions**: No rate limits, no paywalls, and no unexpected token bills.
4. **Permanent Ownership**: Your developer tools cannot be deprecated or modified by an upstream cloud vendor.

---

## 🚀 Quick Start

### 1. Prerequisites
* [Node.js](https://nodejs.org/) v18.0.0 or higher (v24 LTS recommended).
* [Ollama](https://ollama.com/) or [LM Studio](https://lmstudio.ai/) running locally.

### 2. Summon an Open-Weight Model
```bash
# Pull and start Google Gemma 3 (recommended default)
ollama run gemma3:4b

# Or use Qwen 3
ollama run qwen3:4b
```

### 3. Run Haunted Shell
Clone or navigate to the repository:
```bash
cd haunted-shell

# Link globally (optional)
npm link

# Run directly
haunted-shell --help
# or
node index.js --help
```

---

## ⚙️ Configuration & Options

All flags can also be configured via environment variables:

| Option | Flag | Environment Variable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Provider** | `-p, --provider` | `HAUNTED_PROVIDER` | `ollama` | Provider: `ollama` or `lmstudio` |
| **Model** | `-m, --model` | `HAUNTED_MODEL` | `gemma3:4b` | Model name (e.g. `gemma3:4b`, `qwen3:4b`) |
| **Endpoint** | `-e, --endpoint` | `HAUNTED_ENDPOINT` | *Provider default* | `/v1/chat/completions` endpoint URL |
| **Temperature** | `-t, --temperature` | — | `0.7` | Sampling temperature for the model |
| **Help** | `-h, --help` | — | — | Show CLI help grimoire |
| **Version** | `-v, --version` | — | — | Output version number |

### Examples
```bash
# Perform an autopsy using Gemma 3
node index.js autopsy

# Use a specific local model
node index.js --model qwen3:4b autopsy

# Commune via LM Studio on port 1234
node index.js --provider lmstudio --model local-model seance

# Exorcise a failing test suite
node index.js exorcise npm test
```

---

## 🕯️ Live Output Showcase

### Autopsy Output (Sample Run with Gemma 3)
```text
⚰️  BEGINNING POST-MORTEM AUTOPSY ON THE REPOSITORY...
Inspecting branch 'main', recent commits, and deleted code tombs...

(A chilling gust of wind rustles through the repository, and the spectral glow intensifies.)

Hark! I, the Spectral Chronicler, have surveyed the wreckage. 
The echoes of these revisions… disturbing. Let us delve into the shadowed depths.

1. The Exhumation (Summary of What Was Killed)
The recent activity reveals a frantic attempt to deliver a “zero-dependency haunted-shell CLI”.
The initial commit appears to be a rudimentary placeholder. The subsequent addition represents
a complete architecture. Crucially, empty fields from package.json were deliberate removals.

2. Haunted Bug Warnings (Specific Defects & Regressions)
* Regression: Absence of Testing: The "Error: no test specified" test remains.
* Spectral Echoes: The shell designation suggests deep system integration.

3. The Healing Rite (Concrete Code & Git Actions)
* Package.json Verification: Ensure description, license, and scripts are purified.
* Surgical Refactoring: Prioritize modularity and clear error propagation.
```

### Exorcise Output (Catching a Crashed Process)
```text
⚡ INITIATING TRIAL FOR COMMAND: node -e 'throw new ReferenceError("spectral_pointer is not defined")'
Executing in process chamber...

[eval]:1
throw new ReferenceError("spectral_pointer is not defined")
^
ReferenceError: spectral_pointer is not defined
    at [eval]:1:7

────────────────────────────────────────────────────────────

⚡ CRASH DETECTED! A curse has possessed the process (Exit Code: 1).
Summoning spectral diagnosis from gemma3:4b...

1. The Curse Identified:
The spectral curse is one of unfulfilled expectation. The process sought to summon 
a variable—spectral_pointer—only to meet with a chilling silence in memory.

2. The Forensic Breakdown:
A ReferenceError was explicitly thrown during evaluation. The identifier was not
allocated in the lexical scope before execution.

3. The Banishing Incantation:
Declare the variable or wrap within a protective try/catch ward:
try {
  invoke(spectral_pointer);
} catch (e) {
  console.warn("The spirit was absent:", e.message);
}
```

---

## 🏆 Hacktoberfest 2026 Submission Details

* **Challenge**: [Hacktoberfest Open-Source AI Challenge: Week 4](https://dev.to/events/challenges/hacktoberfest-week4-2026-10-26)
* **Required Tag**: `#hf26challenge`
* **Additional Tags**: `#hacktoberfest`, `#ai`, `#opensource`, `#node`
* **Theme**: *Ghost in the Machine* (Halloween / Día de los Muertos inspired builds with open-source/open-weight AI)

---

## ⚖️ License

MIT © [Dhruv Gupta](https://github.com/dhruv-gupta-dev)
