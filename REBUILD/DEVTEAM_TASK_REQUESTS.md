# DEV TEAM Task Requests for 3-Page Web App

**Main Reference for All Tasks:**
- [REBUILD/PRD-3PAGE-APP.md] (Product Requirements Document)

**Additional Reference (for UI/design tasks):**
- [REBUILD/UI screenshot.jpeg] (UI Visual Reference)

---

## I. PREPARATION Page Development

### Task 1.1: PREPARATION Page - UI Components & State Management
**Prompt:**
Generate the complete UI and state management logic for the PREPARATION page. This includes a rich text editor for 'Overview' and 'PRD' (e.g., using Quill.js or Draft.js), a dynamic 'Task List' builder (add/edit/delete tasks), per-task prompt input, and file attachment input (supporting text/markdown files). Ensure the UI is responsive and modern. Connect all controls to state (e.g., React Context or Redux). Ignore backend integration for this task.

**Attachments:**
- PRD (REBUILD/PRD-3PAGE-APP.md)
- UI screenshot (REBUILD/UI screenshot.jpeg)

---

### Task 1.2: PREPARATION Page - File Handling & Export Logic
**Prompt:**
Implement the code for handling file attachments (upload/download) for tasks and exporting the 'Task List' in JSON, CSV, and Markdown formats on the PREPARATION page. Ensure attached files are text/markdown and exported files conform to valid formats including all task details. Modularize export utilities for reuse.

**Attachments:**
- PRD (REBUILD/PRD-3PAGE-APP.md)
- (Optional) Sample task list, if available

---

### Task 1.3: PREPARATION Page - Data Transfer to DEV TEAM
**Prompt:**
Implement the logic to transfer the 'Task List' and its associated data from the PREPARATION page to the DEV TEAM page. This should occur when the 'Send to DEV TEAM' button is clicked, persisting all task data for immediate loading on the DEV TEAM page (e.g., via in-app state, local storage, or a simple data passing mechanism). Include error handling and user feedback for success/failure.

**Attachments:**
- PRD (REBUILD/PRD-3PAGE-APP.md)

---

## II. CLEANER Page Development

### Task 2.1: CLEANER Page - UI Components & Input Handling
**Prompt:**
Build the CLEANER page UI with an input area for aggregated data import (from DEV TEAM or manual paste). Include controls for summarization, formatting, and labeling (buttons/menus), a live preview of cleaned data, and a 'Download as .md' button. Ensure the interface is modern and responsive.

**Attachments:**
- PRD (REBUILD/PRD-3PAGE-APP.md)
- UI screenshot (REBUILD/UI screenshot.jpeg)

---

### Task 2.2: CLEANER Page - AI-Assisted Data Cleaning Tools
**Prompt:**
Write the core logic for AI-assisted and manual tools to summarize, format, label, and clean aggregated data on the CLEANER page. Implement functions for summarization, Markdown formatting, and custom labeling. Integrate with the UI and provide user feedback for each operation.

**Attachments:**
- PRD (REBUILD/PRD-3PAGE-APP.md)

---

### Task 2.3: CLEANER Page - Automation & Final Data Export
**Prompt:**
Implement the automation logic to receive data from the DEV TEAM page, process it through the CLEANER tools, and export the final cleaned dataset as a Markdown file. Ensure the process can be triggered automatically (e.g., via a 'GENERATE DATA' button) and provide clear user feedback and error handling.

**Attachments:**
- PRD (REBUILD/PRD-3PAGE-APP.md)

---

## III. Integration & Assembly

### Task 3.1: Integration of PREPARATION, DEV TEAM, and CLEANER Pages
**Prompt:**
Write the code to integrate the PREPARATION, DEV TEAM, and CLEANER pages into a single React app with tab or sidebar navigation. Ensure seamless data transfer between pages, support for both manual and automated workflows, and a modern, responsive layout. Document the integration points and any assumptions.

**Attachments:**
- PRD (REBUILD/PRD-3PAGE-APP.md)
- UI screenshot (REBUILD/UI screenshot.jpeg)

---

### Task 3.2: Final Assembly & Testing Guide
**Prompt:**
Provide a step-by-step guide for assembling the full 3-page app, including how to test each page independently and as part of the automated flow. List any dependencies, setup steps, and troubleshooting tips. Deliver as a Markdown file.

**Attachments:**
- PRD (REBUILD/PRD-3PAGE-APP.md)

---

**Note:** If any task requires additional context or sample data, create or request a supporting document and attach it to the task request. 