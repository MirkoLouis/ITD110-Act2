// This file handles the interactive "Supply Chain Map" on the results page.
// It uses a library called Vis.js to turn database data into a clickable graph.

document.addEventListener('DOMContentLoaded', async () => {
    // We grab the Batch ID from the page so we know which chemical to trace.
    const batchId = document.getElementById('batch-id-display').innerText;
    const container = document.getElementById('graph-container');

    try {
        // Step 1: Fetch the graph data from our server (src/app.js).
        // The server returns a list of "nodes" (the circles) and "edges" (the lines).
        const response = await fetch(`/api/trace-graph?batchId=${batchId}`);
        const data = await response.json();

        // Step 2: Special coloring for the starting chemical.
        // If the chemical is RECALLED, we color it red. If it's OK, we color it green.
        const processedNodes = data.nodes.map(node => {
            if (node.group === 'AgriChemical') {
                if (node.status === 'RECALLED') {
                    return { ...node, color: { background: '#d32f2f', border: '#b71c1c' } };
                } else {
                    return { ...node, color: { background: '#388e3c', border: '#1b5e20' } };
                }
            }
            return node;
        });

        // Step 3: Configure how the graph looks.
        // We define different shapes for different entities (like stars for Markets).
        const options = {
            nodes: {
                shape: 'dot',
                size: 25,
                font: {
                    size: 14,
                    color: '#212121', 
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
                // Farms are shown as green hexagons.
                Farm: { 
                    shape: 'hexagon',
                    color: { background: '#81c784', border: '#2e7d32' },
                    size: 30 
                },
                // Crops are shown as light green boxes.
                CropBatch: { 
                    shape: 'box',
                    color: { background: '#aed581', border: '#558b2f' },
                    font: { size: 12 }
                },
                // Processing plants are shown as yellow squares.
                ProcessingFacility: { 
                    shape: 'square',
                    color: { background: '#ffd54f', border: '#f9a825' },
                    size: 30
                },
                // Retail markets are shown as blue stars.
                RetailMarket: { 
                    shape: 'star',
                    color: { background: '#64b5f6', border: '#1565c0' },
                    size: 40 
                }
            },
            // This enables "physics," making the nodes bounce and settle into a nice layout.
            physics: {
                enabled: true,
                stabilization: { iterations: 150 },
                barnesHut: {
                    gravitationalConstant: -4000,
                    springLength: 250
                }
            }
        };

        // Step 4: Draw the network inside the container on our results page.
        const network = new vis.Network(container, { nodes: processedNodes, edges: data.edges }, options);
    } catch (error) {
        console.error('Visualization Error:', error);
        container.innerHTML = '<p class="danger">Failed to load graph visualization.</p>';
    }
});
