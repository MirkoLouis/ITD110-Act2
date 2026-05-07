document.addEventListener('DOMContentLoaded', async () => {
    const batchId = document.getElementById('batch-id-display').innerText;
    const container = document.getElementById('graph-container');

    try {
        const response = await fetch(\`/api/trace-graph?batchId=\${batchId}\`);
        const data = await response.json();

        const options = {
            nodes: {
                shape: 'dot',
                size: 20,
                font: {
                    size: 14,
                    color: '#212121'
                },
                borderWidth: 2,
                shadow: true
            },
            edges: {
                width: 2,
                color: { inherit: 'from' },
                arrows: {
                    to: { enabled: true, scaleFactor: 1, type: 'arrow' }
                },
                font: {
                    size: 10,
                    align: 'middle'
                }
            },
            groups: {
                AgriChemical: { color: { background: '#d32f2f', border: '#b71c1c' }, font: { color: '#ffffff' } },
                Farm: { color: { background: '#2e7d32', border: '#1b5e20' }, font: { color: '#ffffff' } },
                CropBatch: { color: { background: '#66bb6a', border: '#388e3c' } },
                ProcessingFacility: { color: { background: '#ffca28', border: '#ffa000' } },
                RetailMarket: { color: { background: '#42a5f5', border: '#1976d2' } }
            },
            physics: {
                enabled: true,
                stabilization: { iterations: 150 }
            }
        };

        const network = new vis.Network(container, data, options);
    } catch (error) {
        console.error('Visualization Error:', error);
        container.innerHTML = '<p class="danger">Failed to load graph visualization.</p>';
    }
});
