const API_URL = 'http://localhost:3000/api/poverty';

const csvFileInput = document.getElementById('csv-file');
const importBtn = document.getElementById('import-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const clearFirstCheck = document.getElementById('clear-first');
const importStatus = document.getElementById('import-status');
const dataForm = document.getElementById('data-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const regionInput = document.getElementById('region');
const ageGroupInput = document.getElementById('age-group');
const yearInput = document.getElementById('year');
const povertyRateInput = document.getElementById('poverty-rate');
const editOriginalRegion = document.getElementById('edit-original-region');
const editOriginalAgeGroup = document.getElementById('edit-original-age-group');
const editOriginalYear = document.getElementById('edit-original-year');
const regionSelect = document.getElementById('region-select');
const dataTbody = document.getElementById('data-tbody');
const noData = document.getElementById('no-data');

let isEditing = false;
let currentData = [];
let sortConfig = { key: 'region', direction: 'asc' };

// ---- Import ----
importBtn.addEventListener('click', async () => {
    const file = csvFileInput.files[0];
    if (!file) {
        showImportStatus('Please select a CSV file.', true);
        return;
    }

    const text = await file.text();
    const clearFirst = clearFirstCheck.checked;
    
    importBtn.disabled = true;
    importBtn.textContent = 'Importing...';

    try {
        const res = await fetch(`${API_URL}/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ csv: text, clearFirst }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        showImportStatus(data.message, false);
        loadRegions();
        loadData();
    } catch (err) {
        showImportStatus(err.message, true);
    } finally {
        importBtn.disabled = false;
        importBtn.textContent = 'Import CSV';
    }
});

// ---- Clear All ----
clearAllBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to clear ALL data points? This action cannot be undone.')) return;

    clearAllBtn.disabled = true;
    clearAllBtn.textContent = 'Clearing...';

    try {
        const res = await fetch(`${API_URL}/all`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        showImportStatus(data.message, false);
        loadRegions();
        loadData();
    } catch (err) {
        showImportStatus(err.message, true);
    } finally {
        clearAllBtn.disabled = false;
        clearAllBtn.textContent = 'Clear All Data';
    }
});

function showImportStatus(msg, isError) {
    importStatus.textContent = msg;
    importStatus.className = isError ? 'status error' : 'status success';
    importStatus.classList.remove('hidden');
    if (!isError) {
        setTimeout(() => importStatus.classList.add('hidden'), 5000);
    }
}

// ---- Region dropdown ----
async function loadRegions() {
    try {
        const res = await fetch(`${API_URL}/regions`);
        const regions = await res.json();
        regionSelect.innerHTML = '<option value="">-- All Regions --</option>';
        regions.forEach((r) => {
            const opt = document.createElement('option');
            opt.value = r;
            opt.textContent = r;
            regionSelect.appendChild(opt);
        });
    } catch {
        // ignore
    }
}

regionSelect.addEventListener('change', loadData);

// ---- Sorting ----
document.querySelectorAll('.sort-header').forEach(header => {
    header.addEventListener('click', () => {
        const key = header.getAttribute('data-sort');
        if (sortConfig.key === key) {
            sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            sortConfig.key = key;
            sortConfig.direction = 'asc';
        }
        
        updateSortIndicators();
        renderTable(currentData);
    });
});

function updateSortIndicators() {
    document.querySelectorAll('.sort-header').forEach(header => {
        header.classList.remove('asc', 'desc');
        if (header.getAttribute('data-sort') === sortConfig.key) {
            header.classList.add(sortConfig.direction);
        }
    });
}

// ---- Load table data ----
async function loadData() {
    const selected = regionSelect.value;
    try {
        if (selected) {
            const res = await fetch(`${API_URL}/${encodeURIComponent(selected)}`);
            currentData = await res.json();
        } else {
            const regRes = await fetch(`${API_URL}/regions`);
            const regions = await regRes.json();
            currentData = [];
            for (const r of regions) {
                const res = await fetch(`${API_URL}/${encodeURIComponent(r)}`);
                const data = await res.json();
                currentData.push(...data);
            }
        }
        renderTable(currentData);
    } catch {
        renderTable([]);
    }
}

function renderTable(rows) {
    dataTbody.innerHTML = '';

    if (rows.length === 0) {
        noData.classList.remove('hidden');
        return;
    }

    noData.classList.add('hidden');

    // Apply sorting
    const sortedRows = [...rows].sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        
        // Secondary sort to maintain stability
        if (sortConfig.key !== 'region') {
            return a.region.localeCompare(b.region);
        }
        return 0;
    });

    sortedRows.forEach((r) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(r.region)}</td>
            <td>${escapeHtml(r.age_group)}</td>
            <td>${r.year}</td>
            <td>${r.poverty_rate.toFixed(1)}</td>
            <td>
                <button class="btn-edit" onclick="editRow('${escapeAttr(r.region)}', '${escapeAttr(r.age_group)}', ${r.year}, ${r.poverty_rate})">Edit</button>
                <button class="btn-delete" onclick="deleteRow('${escapeAttr(r.region)}', '${escapeAttr(r.age_group)}', ${r.year})">Delete</button>
            </td>
        `;
        dataTbody.appendChild(tr);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeAttr(text) {
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// ---- CRUD Form ----
dataForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const region = regionInput.value.trim();
    const age_group = ageGroupInput.value.trim();
    const year = parseInt(yearInput.value);
    const poverty_rate = parseFloat(povertyRateInput.value);

    try {
        if (isEditing) {
            const origRegion = editOriginalRegion.value;
            const origAgeGroup = editOriginalAgeGroup.value;
            const origYear = parseInt(editOriginalYear.value);

            if (origRegion !== region || origAgeGroup !== age_group || origYear !== year) {
                await fetch(`${API_URL}/${encodeURIComponent(origRegion)}/${encodeURIComponent(origAgeGroup)}/${origYear}`, { method: 'DELETE' });
                await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ region, age_group, year, poverty_rate }),
                });
            } else {
                await fetch(`${API_URL}/${encodeURIComponent(region)}/${encodeURIComponent(age_group)}/${year}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ poverty_rate }),
                });
            }
        } else {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ region, age_group, year, poverty_rate }),
            });
        }

        resetForm();
        loadRegions();
        loadData();
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

function editRow(region, age_group, year, poverty_rate) {
    isEditing = true;
    formTitle.textContent = 'Edit Data Point';
    submitBtn.textContent = 'Update';
    cancelBtn.classList.remove('hidden');

    editOriginalRegion.value = region;
    editOriginalAgeGroup.value = age_group;
    editOriginalYear.value = year;
    regionInput.value = region;
    ageGroupInput.value = age_group;
    yearInput.value = year;
    povertyRateInput.value = poverty_rate;
    regionInput.focus();
}

async function deleteRow(region, age_group, year) {
    if (!confirm(`Delete ${region} - ${age_group} (${year})?`)) return;

    try {
        await fetch(`${API_URL}/${encodeURIComponent(region)}/${encodeURIComponent(age_group)}/${year}`, { method: 'DELETE' });
        loadData();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

cancelBtn.addEventListener('click', resetForm);

function resetForm() {
    dataForm.reset();
    editOriginalRegion.value = '';
    editOriginalAgeGroup.value = '';
    editOriginalYear.value = '';
    isEditing = false;
    formTitle.textContent = 'Add Data Point';
    submitBtn.textContent = 'Add';
    cancelBtn.classList.add('hidden');
}

// ---- Init ----
updateSortIndicators();
loadRegions();
loadData();
