document.addEventListener('DOMContentLoaded', async () => {
    const batchId = document.getElementById('batch-id-display').innerText;
    const container = document.getElementById('graph-container');

    try {
        const response = await fetch(`/api/trace-graph?batchId=${batchId}`);
        const data = await response.json();

        // Process nodes to apply status-based coloring
        const processedNodes = data.nodes.map(node => {
            if (node.group === 'AgriChemical') {
                if (node.status === 'RECALLED') {
                    // Red background for Recalled, Dark text for visibility on white background
                    return { ...node, color: { background: '#d32f2f', border: '#b71c1c' } };
                } else {
                    // Green background for OK, Dark text for visibility on white background
                    return { ...node, color: { background: '#388e3c', border: '#1b5e20' } };
                }
            }
            return node;
        });

        const options = {
            nodes: {
                shape: 'dot',
                size: 25,
                font: {
                    size: 14,
                    color: '#212121', // Dark text for readability on the white card background
                    strokeWidth: 2,
                    strokeColor: '#ffffff'
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
                Farm: { 
                    shape: 'hexagon',
                    color: { background: '#81c784', border: '#2e7d32' },
                    size: 30 
                },
                CropBatch: { 
                    shape: 'box',
                    color: { background: '#aed581', border: '#558b2f' },
                    font: { size: 12 }
                },
                ProcessingFacility: { 
                    shape: 'square',
                    color: { background: '#ffd54f', border: '#f9a825' },
                    size: 30
                },
                RetailMarket: { 
                    shape: 'star',
                    color: { background: '#64b5f6', border: '#1565c0' },
                    size: 40 
                }
            },
            physics: {
                enabled: true,
                stabilization: { iterations: 150 },
                barnesHut: {
                    gravitationalConstant: -4000,
                    springLength: 250
                }
            }
        };

        const network = new vis.Network(container, { nodes: processedNodes, edges: data.edges }, options);
    } catch (error) {
        console.error('Visualization Error:', error);
        container.innerHTML = '<p class="danger">Failed to load graph visualization.</p>';
    }
});
