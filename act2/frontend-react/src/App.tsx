import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { 
  UserPlus, 
  Users, 
  Trash2, 
  Edit3, 
  Mail, 
  BookOpen, 
  Calendar, 
  DollarSign,
  XCircle,
  Save,
  UserCheck,
  GraduationCap
} from 'lucide-react';
import './App.css';

interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  yearLevel: string;
  age: string;
  networth: string;
}

const API_URL = 'http://localhost:3000/api/students';

function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    course: '',
    yearLevel: '',
    age: '',
    networth: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      toast.error('Failed to fetch students');
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(isEditing ? 'Updating student...' : 'Adding student...');

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `${API_URL}/${formData.id}` : API_URL;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save');

      toast.success(isEditing ? 'Student updated!' : 'Student added!', { id: loadingToast });
      resetForm();
      fetchStudents();
    } catch (error) {
      toast.error('Error saving student', { id: loadingToast });
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
        yearLevel: student.yearLevel,
        age: student.age,
        networth: student.networth
      });

      setIsEditing(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast.error('Could not load student details');
    }
  };

  const deleteStudent = async (id: string) => {
    toast((t) => (
      <span className="confirm-toast">
        Delete this student?
        <button 
          onClick={() => {
            confirmDelete(id);
            toast.dismiss(t.id);
          }}
          className="btn-confirm-delete"
        >
          Yes
        </button>
        <button onClick={() => toast.dismiss(t.id)} className="btn-cancel-delete">
          No
        </button>
      </span>
    ), { duration: 4000 });
  };

  const confirmDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      toast.success('Student deleted');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData({ id: '', name: '', email: '', course: '', yearLevel: '', age: '', networth: '' });
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
      <Toaster position="top-right" />
      
      <motion.h1 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Users size={40} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
        Student Hub (React)
      </motion.h1>

      <motion.div 
        className="form-container"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="flex-center">
          {isEditing ? <UserCheck className="icon-gap" /> : <UserPlus className="icon-gap" />}
          {isEditing ? 'Edit Student Details' : 'Register New Student'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Full Name" />
          </div>

          <div className="form-group">
            <label><Mail size={16} className="label-icon" /> Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="email@example.com" />
          </div>

          <div className="form-grid-4">
            <div className="form-group">
              <label><Calendar size={16} className="label-icon" /> Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleInputChange} required min="1" />
            </div>
            <div className="form-group">
              <label><DollarSign size={16} className="label-icon" /> Networth</label>
              <input type="number" name="networth" step="1" value={formData.networth} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label><BookOpen size={16} className="label-icon" /> Course</label>
              <select 
                name="course" 
                value={formData.course} 
                onChange={(e) => setFormData({ ...formData, course: e.target.value })} 
                required
              >
                <option value="" disabled>Select Course</option>
                <option value="BSIT">BSIT</option>
                <option value="BSCS">BSCS</option>
                <option value="BSIS">BSIS</option>
                <option value="BSCA">BSCA</option>
              </select>
            </div>
            <div className="form-group">
              <label><GraduationCap size={16} className="label-icon" /> Year</label>
              <select 
                name="yearLevel" 
                value={formData.yearLevel} 
                onChange={(e) => setFormData({ ...formData, yearLevel: e.target.value })} 
                required
              >
                <option value="" disabled>Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          <div className="form-actions-react">
            <button type="submit" id="submit-btn" className="btn-icon">
              <Save size={18} /> {isEditing ? 'Update Student' : 'Add Student'}
            </button>
            {isEditing && (
              <button type="button" id="cancel-btn" className="btn-icon" onClick={resetForm}>
                <XCircle size={18} /> Cancel
              </button>
            )}
          </div>
        </form>
      </motion.div>

      <motion.div 
        className="table-container"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h2><Users className="icon-gap" /> Enrolled Students</h2>
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Year</th>
              <th>Age</th>
              <th>Networth</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {isLoading ? (
                <tr><td colSpan={6} className="loading-text">Loading students...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={6} id="no-students">No records found.</td></tr>
              ) : (
                students.map((student, index) => (
                  <motion.tr 
                    key={student.id}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 10, opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <td>
                      <div className="student-info">
                        <strong>{student.name}</strong>
                        <span className="sub-text">{student.email}</span>
                      </div>
                    </td>
                    <td>{student.course}</td>
                    <td>{student.yearLevel}</td>
                    <td>{student.age}</td>
                    <td className="networth-cell">{formatCurrency(student.networth)}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit-icon" title="Edit" onClick={() => editStudent(student.id)}>
                          <Edit3 size={18} />
                        </button>
                        <button className="btn-delete-icon" title="Delete" onClick={() => deleteStudent(student.id)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}

export default App;
