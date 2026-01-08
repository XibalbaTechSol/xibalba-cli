import React, { useState, useEffect } from 'react';

const DevTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dom' | 'console'>('dom');
  const [dom, setDom] = useState('');
  const [consoleMessages, setConsoleMessages] = useState<string[]>([]);

  useEffect(() => {
    if (activeTab === 'console') {
      const ws = new WebSocket('ws://localhost:3000/browser/console');
      ws.onmessage = (event) => {
        setConsoleMessages((prevMessages) => [...prevMessages, event.data]);
      };
      return () => {
        ws.close();
      };
    }
  }, [activeTab]);


  const fetchDom = async () => {
    try {
      const response = await fetch('http://localhost:3000/browser/dom');
      const data = await response.text();
      setDom(data);
    } catch (error) {
      console.error('Error fetching DOM:', error);
    }
  };

  return (
    <div>
      <div>
        <button onClick={() => setActiveTab('dom')}>DOM Inspector</button>
        <button onClick={() => setActiveTab('console')}>Console Viewer</button>
      </div>
      <div>
        {activeTab === 'dom' && (
          <div>
            <button onClick={fetchDom}>Fetch DOM</button>
            <pre><code>{dom}</code></pre>
          </div>
        )}
        {activeTab === 'console' && (
          <div>
            <div>
              {consoleMessages.map((message, index) => (
                <div key={index}>{message}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevTools;
