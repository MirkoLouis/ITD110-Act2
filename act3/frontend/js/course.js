const API_URL = 'http://localhost:5001/api/courses';

const form = document.getElementById('course-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const courseIdInput = document.getElementById('course-id');
const courseCodeInput = document.getElementById('course-code');
const courseNameInput = document.getElementById('course-name');
const descriptionInput = document.getElementById('description');
const creditsInput = document.getElementById('credits');
const tbody = document.getElementById('courses-tbody');
const noCoursesMsg = document.getElementById('no-courses');

let isEditing = false;

document.addEventListener('DOMContentLoaded', fetchCourses);

form.addEventListener('submit', handleSubmit);
cancelBtn.addEventListener('click', resetForm);

async function fetchCourses() {
    try {
        const response = await fetch(API_URL);
        const courses = await response.json();
        renderCourses(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
    }
}

function renderCourses(courses) {
    tbody.innerHTML = '';

    if (courses.length === 0) {
        noCoursesMsg.classList.remove('hidden');
        return;
    }

    noCoursesMsg.classList.add('hidden');

    courses.forEach(course => {
        const row = document.createElement('tr');
        const studentTags = course.students && course.students.length > 0
            ? course.students.map(s => `<span class="course-tag" title="${escapeHtml(s.name)}">${escapeHtml(s.studentId || 'N/A')}</span>`).join('')
            : '<span style="color: #94a3b8;">-</span>';
        const facultyTags = course.faculty && course.faculty.length > 0
            ? course.faculty.map(f => `<span class="course-tag">${escapeHtml(f.name)}</span>`).join('')
            : '<span style="color: #94a3b8;">-</span>';
        
        row.innerHTML = `
            <td><span style="font-weight: 600; color: #3b82f6;">${escapeHtml(course.courseCode)}</span></td>
            <td style="font-weight: 500;">${escapeHtml(course.courseName)}</td>
            <td style="text-align: center;"><span style="background: #f1f5f9; padding: 2px 8px; border-radius: 999px; font-weight: 600;">${course.credits ?? '-'}</span></td>
            <td>${studentTags}</td>
            <td>${facultyTags}</td>
            <td>
                <button class="btn-edit" onclick="editCourse('${course._id}')">Edit</button>
                <button class="btn-delete" onclick="deleteCourse('${course._id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function handleSubmit(e) {
    e.preventDefault();

    const courseData = {
        courseCode: courseCodeInput.value.trim(),
        courseName: courseNameInput.value.trim(),
        description: descriptionInput.value.trim(),
        credits: creditsInput.value ? Number(creditsInput.value) : null
    };

    try {
        if (isEditing) {
            await fetch(`${API_URL}/${courseIdInput.value}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(courseData)
            });
        } else {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(courseData)
            });
        }

        resetForm();
        fetchCourses();
    } catch (error) {
        console.error('Error saving course:', error);
    }
}

async function editCourse(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const course = await response.json();

        courseIdInput.value = course._id;
        courseCodeInput.value = course.courseCode;
        courseNameInput.value = course.courseName;
        descriptionInput.value = course.description || '';
        creditsInput.value = course.credits ?? '';

        isEditing = true;
        formTitle.textContent = 'Edit Course';
        submitBtn.textContent = 'Update Course';
        cancelBtn.classList.remove('hidden');

        courseCodeInput.focus();
    } catch (error) {
        console.error('Error fetching course:', error);
    }
}

async function deleteCourse(id) {
    if (!confirm('Are you sure you want to delete this course?')) {
        return;
    }

    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchCourses();
    } catch (error) {
        console.error('Error deleting course:', error);
    }
}

function resetForm() {
    form.reset();
    courseIdInput.value = '';
    isEditing = false;
    formTitle.textContent = 'Add New Course';
    submitBtn.textContent = 'Add Course';
    cancelBtn.classList.add('hidden');
}
