import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static('public'));

async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 8000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal  
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out');
        }
        throw error;
    }
}

async function fetchLatestBlockNumber() {
    const apiUrl = 'https://api.dusk.network/v1/blocks?node=nodes.dusk.network';
    try {
        const response = await fetchWithTimeout(apiUrl);
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        const jsonData = await response.json();
        const latestBlock = jsonData.data.blocks[0];
        return latestBlock.header.height;
    } catch (error) {
        console.error(`Failed to fetch the latest block number:`, error);
        throw error;
    }
}

async function fetchBlockTimestamp(blockNumber) {
    const apiUrl = 'https://api.dusk.network/v1/blocks?node=nodes.dusk.network';
    try {
        const response = await fetchWithTimeout(apiUrl);
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        const jsonData = await response.json();
        const block = jsonData.data.blocks.find(b => b.header.height === blockNumber);
        if (!block) {
            throw new Error(`Block with height ${blockNumber} not found`);
        }
        return new Date(block.header.timestamp).getTime() / 1000;
    } catch (error) {
        console.error(`Failed to fetch block timestamp for block number ${blockNumber}:`, error);
        throw error;
    }
}

app.get('/latest-block', async (req, res) => {
    try {
        const latestBlockNumber = await fetchLatestBlockNumber();
        res.json({ latestBlockNumber });
    } catch (error) {
        console.error('Error fetching the latest block number:', error);
        res.status(500).send('Failed to fetch the latest block number.');
    }
});

app.get('/estimate-time/:targetBlock', async (req, res) => {
    try {
        const currentBlock = await fetchLatestBlockNumber();
        const targetBlock = parseInt(req.params.targetBlock);
        const startTime = await fetchBlockTimestamp(currentBlock - 50);
        const endTime = await fetchBlockTimestamp(currentBlock);
        const averageBlockTime = (endTime - startTime) / 50;
        const timeToTarget = (targetBlock - currentBlock) * averageBlockTime;
        const estimatedTime = convertSecondsToDHMS(timeToTarget);
        res.json({ estimatedTime });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to calculate estimated time.');
    }
});

function convertSecondsToDHMS(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const sec = Math.floor(seconds % 60);
    return `${days}d ${hours}h ${minutes}m ${sec}s`;
}

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));




