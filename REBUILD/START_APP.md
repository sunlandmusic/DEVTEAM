# Starting the DEVTEAM Application

## Prerequisites
- Node.js installed
- npm (comes with Node.js)
- Git (for version control)

## First Time Setup
1. Install dependencies:
```bash
npm install
```

## Starting the Development Server
1. From the project root directory, run:
```bash
npm run dev
```

2. Look for the Vite output showing the local URL:
```
  VITE v5.4.19  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

3. The app should automatically open in your default browser
   - If not, manually open the URL shown in the terminal

## Common Issues & Solutions

### Port Already in Use
If you see "Port XXXX is in use":
- Vite will automatically try the next available port
- The new port number will be shown in the terminal
- Use the new URL that Vite provides

### Black Screen or Missing UI
If the app shows a black screen:
1. Check the browser console for errors
2. Try clearing the browser cache
3. Stop the server (Ctrl+C or Cmd+C)
4. Run `npm run dev` again

### Server Wont Start
1. Make sure no other dev server is running
2. Check if all dependencies are installed:
```bash
npm install
```
3. Clear npm cache if needed:
```bash
npm cache clean --force
npm install
```

## Development Tips
- The server auto-reloads when you make changes
- Press h in the terminal for Vite help menu
- Use Ctrl+C (or Cmd+C) to stop the server

## Project Structure
- `/components` - React components
- `/services` - Backend services
- `/styles` - CSS and styling
- `/public` - Static assets

Remember: Always check the terminal output for useful information about the server status and any potential errors.
