import { useState } from 'react';
import { Instance } from './components/InstanceList';
import MainLayout from './components/Layout/MainLayout';
import axios from 'axios';

const ORCHESTRATOR_URL = "http://localhost:3000";

const App = () => {
    // Default instances - start with empty or check backend
    const [instances, setInstances] = useState<Instance[]>([
        { id: '1', name: 'Primary Agent', url: 'http://localhost:8000', status: 'running' }
    ]);
    const [selectedId, setSelectedId] = useState<string>('1');

    const handleAddInstance = async () => {
        const portStr = prompt("Enter port for new instance (e.g. 8001):", "8001");
        if (!portStr) return;
        const port = parseInt(portStr);
        if (isNaN(port)) return;

        try {
            await axios.post(`${ORCHESTRATOR_URL}/spawn`, { port });

            const newId = Date.now().toString();
            const newInstance: Instance = {
                id: newId,
                name: `Agent (:${port})`,
                url: `http://localhost:${port}`,
                status: 'running'
            };

            setInstances([...instances, newInstance]);
            setSelectedId(newId);
        } catch (err) {
            console.error("Failed to spawn instance", err);
            alert("Failed to spawn instance. Ensure orchestrator is running.");
        }
    };

    const handleRemoveInstance = async (id: string) => {
        if (instances.length <= 1) return;

        const instanceToRemove = instances.find(i => i.id === id);
        if (instanceToRemove) {
            const port = parseInt(new URL(instanceToRemove.url).port);
            try {
                await axios.delete(`${ORCHESTRATOR_URL}/kill/${port}`);
            } catch (err) {
                console.error("Failed to kill instance", err);
            }
        }

        const newInstances = instances.filter(i => i.id !== id);
        setInstances(newInstances);

        if (selectedId === id) {
            setSelectedId(newInstances[0].id);
        }
    };

    const handlePause = async (id: string) => {
        const instance = instances.find(i => i.id === id);
        if (!instance) return;
        const port = parseInt(new URL(instance.url).port);
        try {
            await axios.post(`${ORCHESTRATOR_URL}/pause/${port}`);
            setInstances(instances.map(i => i.id === id ? { ...i, status: 'paused' } : i));
        } catch (err) {
            console.error(err);
        }
    };

    const handleResume = async (id: string) => {
        const instance = instances.find(i => i.id === id);
        if (!instance) return;
        const port = parseInt(new URL(instance.url).port);
        try {
            await axios.post(`${ORCHESTRATOR_URL}/resume/${port}`);
            setInstances(instances.map(i => i.id === id ? { ...i, status: 'running' } : i));
        } catch (err) {
            console.error(err);
        }
    };

    const handleOpenFolder = async () => {
        const path = prompt("Enter path to open:", "/home/xibalbasolutions/Desktop/xibalba-cli");
        if (!path) return;
        try {
            await axios.post(`${ORCHESTRATOR_URL}/open-folder`, { path });
        } catch (err) {
            console.error(err);
            alert("Failed to open folder");
        }
    };

    return (
        <MainLayout
            instances={instances}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAdd={handleAddInstance}
            onRemove={handleRemoveInstance}
            onPause={handlePause}
            onResume={handleResume}
            onOpenFolder={handleOpenFolder}
        />
    );
};

export default App;
