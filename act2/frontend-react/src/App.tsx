import { useState, useEffect } from 'react';
import './App.css';

interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  age: string;
  networth: string;
}

const API_URL = 'http://localhost:3000/api/students';

function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    course: '',
    age: '',
    networth: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await fetch(`${API_URL}/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      resetForm();
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  const editStudent = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      const student = await response.json();

      setFormData({
        id: student.id,
        name: student.name,
        email: student.email,
        course: student.course,
        age: student.age,
        networth: student.networth
      });

      setIsEditing(true);
    } catch (error) {
      console.error('Error fetching student:', error);
    }
  };

  const deleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      email: '',
      course: '',
      age: '',
      networth: ''
    });
    setIsEditing(false);
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(Number(amount));
  };

  return (
    <div className="container">
      <h1>Student Management System (React)</h1>

      <div className="form-container">
        <h2>{isEditing ? 'Edit Student' : 'Add New Student'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="course">Course</label>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="networth">Networth</label>
            <input
              type="number"
              name="networth"
              step="0.01"
              value={formData.networth}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" id="submit-btn">
              {isEditing ? 'Update Student' : 'Add Student'}
            </button>
            {isEditing && (
              <button type="button" id="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="table-container">
        <h2>Student List</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Course</th>
              <th>Age</th>
              <th>Networth</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} id="no-students">No students found.</td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.course}</td>
                  <td>{student.age}</td>
                  <td>{formatCurrency(student.networth)}</td>
                  <td>
                    <button className="btn-edit" onClick={() => editStudent(student.id)}>
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => deleteStudent(student.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
