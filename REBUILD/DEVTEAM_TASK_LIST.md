
## Consolidated Task List for 3-Page Web App Development

This task list outlines the code generation steps required to complete your 3-page web app. Each task is designed to be a self-contained prompt for an AI model team, with deliverables expected as `.md` files containing the relevant code and brief documentation. The "DEV TEAM" page is assumed to be fully functional.

---

### **I. PREPARATION Page Development**

**Objective:** To build the user interface and core functionality for the PREPARATION page, enabling users to create project documentation and define tasks.

*   **Task 1.1: PREPARATION Page - UI Components & State Management**
    *   **Prompt:** "Generate the complete UI and state management logic for the PREPARATION page. This includes a rich text editor for 'Overview' and 'PRD' (e.g., using Quill.js or Draft.js), a dynamic 'Task List' builder (add/edit/delete tasks), per-task prompt input, and file attachment input (supporting text/markdown files). Ensure the UI is responsive and modern. Connect all controls to state (e.g., React Context or Redux). Ignore backend integration for this task."
    *   **Deliverable:** `preparation-ui-state.md`

*   **Task 1.2: PREPARATION Page - File Handling & Export Logic**
    *   **Prompt:** "Implement the code for handling file attachments (upload/download) for tasks and exporting the 'Task List' in JSON, CSV, and Markdown formats on the PREPARATION page. Ensure attached files are text/markdown and exported files conform to valid formats including all task details. Modularize export utilities for reuse."
    *   **Deliverable:** `preparation-file-export.md`

*   **Task 1.3: PREPARATION Page - Data Transfer to DEV TEAM**
    *   **Prompt:** "Implement the logic to transfer the 'Task List' and its associated data from the PREPARATION page to the DEV TEAM page. This should occur when the 'Send to DEV TEAM' button is clicked, persisting all task data for immediate loading on the DEV TEAM page (e.g., via in-app state, local storage, or a simple data passing mechanism). Include error handling and user feedback for success/failure."
    *   **Deliverable:** `preparation-to-devteam.md`

---

### **II. CLEANER Page Development**

**Objective:** To create the user interface and functionality for the CLEANER page, allowing users to process and refine aggregated data.

*   **Task 2.1: CLEANER Page - UI Components & Input Handling**
    *   **Prompt:** "Build the CLEANER page UI with an input area for aggregated data import (from DEV TEAM or manual paste). Include controls for summarization, formatting, and labeling (buttons/menus), a live preview of cleaned data, and a 'Download as .md' button. Ensure the interface is modern and responsive."
    *   **Deliverable:** `cleaner-ui.md`

*   **Task 2.2: CLEANER Page - AI-Assisted Data Cleaning Tools**
    *   **Prompt:** "Write the core logic for AI-assisted and manual tools to summarize, format, and label aggregated data within the CLEANER page. Implement summarization, formatting, and labeling modules (as callable functions/components, with placeholders for actual AI API calls if needed). Allow toggling between AI-assisted and manual clean-up. Provide clear status/feedback messaging in the UI."
    *   **Deliverable:** `cleaner-tools.md`

*   **Task 2.3: CLEANER Page - Data Import & Download Logic**
    *   **Prompt:** "Implement the logic for importing aggregated data from the DEV TEAM page (via state, local storage, or file upload) into the CLEANER page. Handle data validations and provide error feedback. Also, code the download/export functionality for the cleaned data as a `.md` file."
    *   **Deliverable:** `cleaner-data-io.md`

---

### **III. Cross-Page Integration & Automation**

**Objective:** To connect the three pages into a seamless workflow and implement the full automation feature.

*   **Task 3.1: Full Workflow Automation ("GENERATE DATA" Pipeline)**
    *   **Prompt:** "Implement the 'GENERATE DATA' pipeline for the entire application. This involves creating a single button (e.g., in a shared header or on the PREPARATION/DEV TEAM page) that orchestrates the sequence: PREPARATION → DEV TEAM → CLEANER with minimal user intervention. Automate data transfer and processing between pages. Include progress/status indicators and robust error handling for the pipeline."
    *   **Deliverable:** `full-pipeline-automation.md`

*   **Task 3.2: Inter-Page State Management & Routing**
    *   **Prompt:** "Implement a robust state management solution (e.g., Context API, Redux, or simple localStorage) to ensure seamless data persistence and transfer between the PREPARATION, DEV TEAM, and CLEANER pages. Also, set up client-side routing (e.g., React Router) to navigate between the three pages while maintaining application state."
    *   **Deliverable:** `inter-page-state-routing.md`

---

### **IV. Non-Functional Requirements & App Structure**

**Objective:** To ensure the final application is polished, reliable, maintainable, and ready for assembly.

*   **Task 4.1: Common UI Components & Responsive Design**
    *   **Prompt:** "Generate a set of reusable UI components (e.g., buttons, input fields, modals, loading indicators, toast notifications) that can be used consistently across all three pages. Ensure the entire application has a responsive design that adapts well to various screen sizes (desktop, tablet, mobile) and maintains a modern, consistent aesthetic."
    *   **Deliverable:** `common-ui-responsive.md`

*   **Task 4.2: Error Handling, User Feedback & Performance Optimization**
    *   **Prompt:** "Integrate robust error handling and user feedback mechanisms throughout the entire app (all pages). Implement alerts, toasts, or status messages for all major actions (processing, errors, completion). Additionally, include performance optimizations (e.g., for handling large task lists or data sets) to ensure a smooth user experience."
    *   **Deliverable:** `error-feedback-performance.md`

*   **Task 4.3: Overall App Structure & Assembly Guide**
    *   **Prompt:** "Generate the overarching application structure, including the main entry point (e.g., `App.js`), global styling, and any necessary configuration files (e.g., `package.json` dependencies). Provide a clear, step-by-step assembly guide in markdown format for the main coder, detailing how to integrate all the generated `.md` files (including the existing DEV TEAM page code) into a single, functional application. Include recommendations for modularization and code comments."
    *   **Deliverable:** `app-structure-assembly-guide.md`

---

**Instructions for AI Teams:**
*   Each task is independent and can be worked on in parallel.
*   Deliverables must be a single `.md` file containing all generated code, clear instructions for integration, and brief documentation.
*   Focus on modularity and reusability to facilitate easy assembly by the main developer.
*   Assume a modern web development stack (e.g., React.js for frontend). If a specific library or framework is preferred, mention it in the prompt.

Once these code generation tasks are completed and delivered as `.md` files, your main coder will be able to quickly assemble the app into a fully functional and operational product.
