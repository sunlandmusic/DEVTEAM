# Product Requirements Document (PRD): 3-Page Web App

## Overview
This web app consists of three independent but connected pages: **PREPARATION**, **DEV TEAM**, and **CLEANER**. Each page can be used standalone or as part of an automated workflow for data-driven project development.

---

## 1. PREPARATION Page
### Purpose
- To develop an overview document, PRD, and a detailed Task List for a project.
- To allow users to create, edit, and save prompts and attach files for each task.

### Features
- Rich text editor for Overview and PRD creation.
- Task List builder: add/edit/delete tasks, each with prompt and optional attachments.
- Attachments: support for text and markdown files.
- Button to export Task List (JSON/CSV/Markdown).
- Button to "Send to DEV TEAM" (imports tasks into the Multi-Task queue on the DEV TEAM page).

### User Flow
1. User creates an overview and PRD.
2. User builds a Task List, adding prompts and attachments as needed.
3. User can export or send the Task List to the DEV TEAM page.

---

## 2. DEV TEAM Page
### Purpose
- To process the Task List using multiple AI models/teams in parallel (Multi-Task queue).
- To collect, display, and export aggregated responses.

### Features
- Multi-Task queue: displays imported or manually added tasks.
- Team selection and status indicators (lights up when active).
- File attachment support for each task.
- Start/Stop processing controls.
- Aggregated response display with copy/export options.
- Button to "Send to CLEANER" (passes results to the next page).

### User Flow
1. User imports Task List or adds tasks manually.
2. User starts processing; teams/models generate responses in parallel.
3. User reviews, copies, or exports results.
4. User can send results to the CLEANER page for further processing.

---

## 3. CLEANER Page
### Purpose
- To summarize, format, label, and clean the aggregated data from DEV TEAM.
- To deliver the final, polished data set for download.

### Features
- Input area for aggregated data (imported from DEV TEAM or manual paste).
- Tools for summarization, formatting, and labeling (AI-assisted and manual options).
- Preview of cleaned/final data.
- Download button for the final .md file.

### User Flow
1. User imports aggregated data from DEV TEAM or pastes it manually.
2. User applies cleaning, summarization, and formatting tools.
3. User previews and downloads the final data set.

---

## Automation & Integration
- Each page can be used independently or as part of a full workflow.
- "GENERATE DATA" button (on PREPARATION or DEV TEAM) runs the full pipeline: PREPARATION → DEV TEAM → CLEANER, with minimal user intervention.
- Data is passed between pages via in-app state, local storage, or file export/import.
- Robust error handling and user feedback at every stage.

---

## Non-Functional Requirements
- Responsive, modern UI/UX.
- Fast, reliable, and scalable for large task lists and data sets.
- Clear user feedback for all actions (processing, errors, completion).
- Modular codebase for easy maintenance and extension.

---

## Open Questions
- What additional file types should be supported for attachments?
- Should there be user authentication or project saving/loading?
- What level of AI/manual control is needed on the CLEANER page?

---

*End of PRD* 