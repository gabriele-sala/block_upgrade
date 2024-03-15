// api/api.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const { targetBlock } = req.query;
    const currentBlock = 450000; // Example current block number
    const blocksToFetch = 10000; // Number of blocks to analyze for average block time

    try {
        // Fetch the last blocksToFetch blocks to calculate average block time
        const startTime = await fetchBlockTime(currentBlock - blocksToFetch + 1);
        const endTime = await fetchBlockTime(currentBlock);
        const avgBlockTime = (endTime - startTime) / (blocksToFetch - 1);

        // Calculate estimated time to reach targetBlock from currentBlock
        const blocksRemaining = targetBlock - currentBlock;
        const estimatedSeconds = avgBlockTime * blocksRemaining;
        
        // Convert estimated time to DD/hh/mm/ss format
        const estimatedTime = convertSeconds(estimatedSeconds);

        res.status(200).send({ estimatedTime });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
};

async function fetchBlockTime(blockNumber) {
    const apiUrl = `https://api.dusk.network/v1/blocks?node=nodes.dusk.network&blockNumber=${blockNumber}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    const blockTime = new Date(data.blocks[0].header.timestamp).getTime() / 1000;
    return blockTime;
}

function convertSeconds(seconds) {
    const days = Math.floor(seconds / (3600*24));
    const hours = Math.floor(seconds % (3600*24) / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const secs = Math.floor(seconds % 60);
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}
