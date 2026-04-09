# Google Workspace Lite — Plugin Design

**Date:** 2026-02-27
**Status:** Approved
**Type:** Claude Code Plugin (MCP Server + Skills)

## Problem

Managing Google Sheets, Docs, and Apps Script deployments from Claude Code currently requires manual steps (copy files, run clasp, open spreadsheets in browser). GAM-based Google Workspace admin tasks for school clients are similarly manual. A custom plugin would streamline these workflows under full local control with no third-party MCP dependencies.

## Decision

Build a Claude Code plugin called `google-workspace-lite` that bundles:

1. An MCP server (Node.js) wrapping the `googleapis` npm package for Sheets and Docs read/write
2. Skills for orchestrated workflows (deploy GAS, check registrations, GAM admin)
3. Config-driven project setup via `.google-workspace.json`

### Why This Approach

- Full control over code and OAuth scopes (no third-party trust)
- MCP server provides structured tools; skills compose them into workflows
- Reusable across projects (ChivHeng Consulting, Staffing Studio, school clients)
- GAM skills shell out to existing CLI — no MCP server expansion needed

### Alternatives Considered

- **Skills-only (no MCP):** Shell out to curl for Google APIs. Fragile token management, poor DX.
- **Standalone MCP (no plugin):** No skills layer for workflow orchestration. Just raw tools.
- **Third-party MCP (AppsScript Pro):** 4 GitHub stars, single maintainer, 55+ tools, broad OAuth scope. Risk/reward doesn't justify it.

## Architecture

```
google-workspace-lite/
├── mcp-server/
│   ├── server.js              # MCP server entry point
│   ├── lib/
│   │   ├── auth.js            # OAuth + service account auth
│   │   ├── sheets.js          # Sheets API wrapper
│   │   ├── docs.js            # Docs API wrapper
│   │   └── gas.js             # clasp wrapper for Apps Script
│   ├── package.json
│   └── .env.example
├── skills/
│   ├── gas-deploy/SKILL.md
│   ├── gas-pull/SKILL.md
│   ├── check-registrations/SKILL.md
│   ├── gam-sync-groups/SKILL.md
│   ├── gam-onboard/SKILL.md
│   └── gam-offboard/SKILL.md
├── plugin.json
└── README.md
```

## MCP Server Tools (14 total)

### Google Sheets (6 tools)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `sheets_read_range` | spreadsheetId, range | Read a range (e.g., `Sheet1!A1:F10`) |
| `sheets_write_range` | spreadsheetId, range, values | Write values to a range |
| `sheets_append_row` | spreadsheetId, sheet, values | Append a row to end of sheet |
| `sheets_get_metadata` | spreadsheetId | Get sheet names, row counts, headers |
| `sheets_find_rows` | spreadsheetId, sheet, column, value | Search for rows matching a column value |
| `sheets_update_cell` | spreadsheetId, sheet, row, col, value | Update a single cell |

### Google Docs (4 tools)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `docs_read` | documentId | Read full document content as markdown |
| `docs_write` | documentId, content | Replace full document content |
| `docs_append` | documentId, content | Append content to end of document |
| `docs_create` | title, folderId?, content? | Create a new document |

### Apps Script via clasp (3 tools)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `gas_pull` | (uses config) | Pull latest code from Apps Script project |
| `gas_push` | (uses config) | Push local code to Apps Script |
| `gas_deploy` | description? | Push and deploy to active deployment |

### Auth (1 tool)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `auth_status` | (none) | Check current auth status and method |

## Skills

### Development Workflows

| Skill | Trigger | What it does |
|-------|---------|-------------|
| `/gas-deploy` | After editing GAS code | Copies local GAS file to gas/Code.js, pushes via clasp, redeploys the active deployment. One command for the 3-step workflow. |
| `/gas-pull` | Sync from remote | Pulls latest code from Apps Script, syncs back to project's local GAS file. |
| `/check-registrations` | Ad-hoc | Reads Sign-up and Waitlist sheets, summarizes seat counts, registered attendees, and waitlisted people per session. |

### GAM Admin Workflows

| Skill | Trigger | What it does |
|-------|---------|-------------|
| `/gam-sync-groups` | Periodic admin | Exports all Google Groups and membership to a Google Sheet using `gam print groups` + `sheets_write_range`. |
| `/gam-onboard` | New hire | Creates user account, adds to groups, sets OU. Prompts for name, email, role. |
| `/gam-offboard` | Staff departure | Suspends account, removes from groups, transfers Drive files. Prompts for confirmation at each step. |

## Project Configuration

Each project provides a `.google-workspace.json` at its root (gitignored):

```json
{
  "auth": "oauth",
  "sheets": {
    "workshops": "SPREADSHEET_ID"
  },
  "docs": {},
  "gas": {
    "scriptId": "SCRIPT_ID",
    "deploymentId": "DEPLOYMENT_ID",
    "localFile": "ChivHeng_CMS_GAS.js",
    "gasDir": "gas"
  },
  "gam": {
    "path": "/Users/chivheng/bin/gam_RPA/gam",
    "domain": "riseprepri.org"
  }
}
```

Different projects/clients configure their own IDs, GAM paths, and domains.

## Authentication

Two modes, selectable per-project via `auth` field:

### OAuth (Personal)
- Same flow as clasp — browser-based OAuth consent
- Tokens stored locally in `~/.google-workspace-lite/tokens/`
- Best for: solo use, development, personal projects

### Service Account
- JSON key file, no browser interaction
- Must share target sheets/docs with the service account email
- Best for: automated/scheduled workflows, client environments

### OAuth Scopes (Limited)
- `https://www.googleapis.com/auth/spreadsheets` — Sheets read/write
- `https://www.googleapis.com/auth/documents` — Docs read/write
- `https://www.googleapis.com/auth/script.projects` — Apps Script code management
- `https://www.googleapis.com/auth/script.deployments` — Apps Script deployment

Deliberately excluded: Gmail, Drive (broad), Calendar, Admin SDK. GAM handles admin tasks through its own auth.

## Security Boundaries

- No Gmail access — emails are sent server-side via GAS, not from this plugin
- No Drive-wide access — only specific spreadsheets and docs listed in config
- Config file gitignored — IDs and credentials stay local
- All code maintained locally — no third-party MCP server
- GAM skills use existing GAM auth — plugin doesn't touch Workspace admin credentials
- Service account keys stored outside repo

## Dependencies

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.x",
    "googleapis": "^150.x",
    "dotenv": "^16.x"
  }
}
```

Minimal dependency tree. No Playwright, no browser automation, no unnecessary packages.

## Implementation Phases

### Phase 1: Core MCP Server
- Auth module (OAuth flow)
- Sheets tools (read, write, append, metadata, find, update)
- Plugin scaffolding and config loading

### Phase 2: Apps Script Integration
- clasp wrapper tools (pull, push, deploy)
- `/gas-deploy` and `/gas-pull` skills

### Phase 3: Docs + Registration Workflows
- Docs tools (read, write, append, create)
- `/check-registrations` skill

### Phase 4: GAM Skills
- `/gam-sync-groups` skill
- `/gam-onboard` and `/gam-offboard` skills

### Phase 5: Service Account Auth
- Service account auth mode
- Token management and switching
