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
