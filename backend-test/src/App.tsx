import { useState } from "react";
import styled from "styled-components";
import { browserManager } from "./BrowserManager";

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background: #1a1a1a;
  min-height: 100vh;
  color: white;
`;

const Button = styled.button<{ $active?: boolean }>`
  padding: 10px 20px;
  border: 1px solid #666;
  background: ${props => props.$active ? "#4a4a4a" : "#2a2a2a"};
  color: white;
  cursor: pointer;
  border-radius: 4px;
  margin: 5px;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #4a4a4a;
  }
`;

const StatusText = styled.div`
  margin-top: 20px;
  color: #aaa;
`;

function App() {
  const [browserOpen, setBrowserOpen] = useState(false);
  const [status, setStatus] = useState("");

  const handleToggleBrowser = async () => {
    try {
      if (!browserOpen) {
        setStatus("Opening browser...");
        await browserManager.initialize(1); // Using team 1 for testing
        const page = await browserManager.navigateToChathub(1);
        await page.evaluate(() => {
          // Minimize the window
          window.document.documentElement.style.visibility = "hidden";
        });
        setBrowserOpen(true);
        setStatus("Browser opened and minimized");
      } else {
        setStatus("Closing browser...");
        await browserManager.cleanup(1);
        setBrowserOpen(false);
        setStatus("Browser closed");
      }
    } catch (error) {
      console.error("Browser operation error:", error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <Container>
      <h2>Browser Control Test</h2>
      
      <Button
        onClick={handleToggleBrowser}
        $active={browserOpen}
      >
        {browserOpen ? "Close Browser" : "Open Browser"}
      </Button>

      <StatusText>{status}</StatusText>
    </Container>
  );
}

export default App;
