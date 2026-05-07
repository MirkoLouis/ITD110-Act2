const API_URL = 'http://localhost:3000/api/poverty';

const csvFileInput = document.getElementById('csv-file');
const importBtn = document.getElementById('import-btn');
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

// ---- Import ----
importBtn.addEventListener('click', async () => {
    const file = csvFileInput.files[0];
    if (!file) {
        showImportStatus('Please select a CSV file.', true);
        return;
    }

    const text = await file.text();
    importBtn.disabled = true;
    importBtn.textContent = 'Importing...';

    try {
        const res = await fetch(`${API_URL}/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ csv: text }),
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

function showImportStatus(msg, isError) {
    importStatus.textContent = msg;
    importStatus.className = isError ? 'status error' : 'status success';
    importStatus.classList.remove('hidden');
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

// ---- Load table data ----
async function loadData() {
    const selected = regionSelect.value;
    try {
        let rows;
        if (selected) {
            const res = await fetch(`${API_URL}/${encodeURIComponent(selected)}`);
            rows = await res.json();
        } else {
            // Load all regions' data
            const regRes = await fetch(`${API_URL}/regions`);
            const regions = await regRes.json();
            rows = [];
            for (const r of regions) {
                const res = await fetch(`${API_URL}/${encodeURIComponent(r)}`);
                const data = await res.json();
                rows.push(...data);
            }
        }

        renderTable(rows);
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

    // Sort: region asc, age_group asc, year desc
    rows.sort((a, b) => 
        a.region.localeCompare(b.region) || 
        a.age_group.localeCompare(b.age_group) || 
        b.year - a.year
    );

    rows.forEach((r) => {
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

            // If primary key components changed, delete old + create new
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
loadRegions();
loadData();
