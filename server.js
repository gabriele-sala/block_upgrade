const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Endpoint to calculate the estimated time to a target block
app.get('/estimate-time/:targetBlock', async (req, res) => {
    const targetBlock = parseInt(req.params.targetBlock);
    // Placeholder for current and start block numbers
    // These should ideally be dynamically determined
    const currentBlock = 450000; // Example current block number
    const blocksToEstimate = 10000;
    const startBlock = currentBlock - blocksToEstimate;

    try {
        const startTime = await fetchBlockTimestamp(startBlock);
        const endTime = await fetchBlockTimestamp(currentBlock);
        const averageBlockTime = (endTime - startTime) / blocksToEstimate;
        const timeToTarget = (targetBlock - currentBlock) * averageBlockTime;
        const estimatedTime = convertSecondsToDHMS(timeToTarget);

        res.json({ estimatedTime });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to calculate estimated time.');
    }
});

// Function to fetch block timestamp
async function fetchBlockTimestamp(blockNumber) {
    const apiUrl = `https://api.dusk.network/v1/blocks?node=nodes.dusk.network`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        const data = await response.json();

        // Assuming the data.blocks is an array of blocks and finding the specific block
        // You may need to adjust logic based on actual API response and how blocks are fetched
        const block = data.blocks.find(b => b.header.height === blockNumber);
        if (!block) {
            throw new Error('Block not found');
        }

        // Convert timestamp string to seconds since epoch
        const timestampInSeconds = new Date(block.header.timestamp).getTime() / 1000;
        return timestampInSeconds;
    } catch (error) {
        console.error(`Failed to fetch block timestamp for block number ${blockNumber}:`, error);
        throw error;
    }
}

// Convert seconds to a more readable format
function convertSecondsToDHMS(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const sec = Math.floor(seconds % 60);
    return `${days}d ${hours}h ${minutes}m ${sec}s`;
}

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

