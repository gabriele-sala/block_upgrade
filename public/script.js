document.getElementById('blockForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const targetBlock = document.getElementById('targetBlock').value;
    fetch(`/estimate-time/${targetBlock}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('result').innerText = `Estimated Time: ${data.estimatedTime}`;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('result').innerText = 'Failed to estimate time.';
        });
});

document.getElementById('refreshLatestBlock').addEventListener('click', function() {
    fetch('/latest-block')
        .then(response => response.json())
        .then(data => {
            alert(`The latest block number is: ${data.latestBlockNumber}`);
            // You can update the UI as needed with this latest block number
        })
        .catch(error => {
            console.error('Error:', error);
        });
});


