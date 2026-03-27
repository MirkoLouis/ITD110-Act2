const API_BASE = 'http://localhost:5001/api';

async function seed() {
    console.log('Starting seeding process...');

    try {
        // 1. Create a Course
        const courseRes = await fetch(`${API_BASE}/courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                courseCode: 'CS101',
                courseName: 'Introduction to Computer Science',
                description: 'Fundamental concepts of programming and logic.',
                credits: 3
            })
        });
        const courseData = await courseRes.json();
        const courseId = courseData._id;
        console.log(`Created Course: ${courseData.courseCode}`);

        // 2. Create another Course
        const courseRes2 = await fetch(`${API_BASE}/courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                courseCode: 'CS102',
                courseName: 'Data Structures',
                description: 'Advanced data organization techniques.',
                credits: 4
            })
        });
        const courseData2 = await courseRes2.json();
        const courseId2 = courseData2._id;
        console.log(`Created Course: ${courseData2.courseCode}`);

        // 3. Create a Student and enroll in CS101
        const studentRes = await fetch(`${API_BASE}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: '2024-001',
                name: 'John Doe',
                email: 'john@example.com',
                courses: [courseId]
            })
        });
        const studentData = await studentRes.json();
        console.log(`Created Student: ${studentData.name} (Enrolled in ${courseData.courseCode})`);

        // 4. Create a Faculty and assign to teach CS101 and CS102
        const facultyRes = await fetch(`${API_BASE}/faculty`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Dr. Alice Smith',
                address: 'Main Building, Room 202',
                department: 'Computer Science',
                courses: [courseId, courseId2]
            })
        });
        const facultyData = await facultyRes.json();
        console.log(`Created Faculty: ${facultyData.name} (Teaches ${courseData.courseCode}, ${courseData2.courseCode})`);

        console.log('Seeding completed successfully!');
    } catch (error) {
        console.error('Seeding failed. Make sure the backend server is running on port 5001.');
        console.error('Error:', error.message);
    }
}

seed();
