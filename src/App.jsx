import React, { useEffect, useRef, useState } from "react";

// ---------- Mock data / course catalog ----------
const COURSES = {
  "React Basics": {
    durations: ["4 weeks", "8 weeks"],
    fees: { "4 weeks": 5000, "8 weeks": 9000 },
  },
  "Advanced JavaScript": {
    durations: ["6 weeks", "12 weeks"],
    fees: { "6 weeks": 7000, "12 weeks": 12000 },
  },
  "UI/UX Design": {
    durations: ["3 weeks", "6 weeks"],
    fees: { "3 weeks": 4000, "6 weeks": 6500 },
  },
  "Python for Data": {
    durations: ["5 weeks", "10 weeks"],
    fees: { "5 weeks": 6000, "10 weeks": 10000 },
  },
};

const COUNTRIES = ["India", "United States", "United Kingdom", "Canada", "Australia", "Other"];

const initialStudent = { name: "", email: "", country: "India", gender: "" };
const emptyCourse = () => ({ id: Math.random().toString(36).slice(2), courseName: "", duration: "", fee: "" });

const validateEmail = (email) => /^[\w-.]+@[\w-]+(\.[\w-]+)+$/.test(email);

export default function App() {
  const [step, setStep] = useState(1);
  const [student, setStudent] = useState(initialStudent);
  const [studentErrors, setStudentErrors] = useState({});
  const [courses, setCourses] = useState([emptyCourse()]);
  const [courseErrors, setCourseErrors] = useState({});
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const fakeExistingEmails = useRef(["alice@example.com", "bob@domain.com"]);
  const emailTimer = useRef(null);

  useEffect(() => {
    setEmailExists(null);
    setIsCheckingEmail(false);
    if (!student.email || !validateEmail(student.email)) return;
    setIsCheckingEmail(true);
    if (emailTimer.current) clearTimeout(emailTimer.current);
    emailTimer.current = setTimeout(() => {
      const emailLower = student.email.trim().toLowerCase();
      const exists = fakeExistingEmails.current.includes(emailLower);
      setEmailExists(exists);
      setIsCheckingEmail(false);
    }, 800);
    return () => {
      if (emailTimer.current) clearTimeout(emailTimer.current);
    };
  }, [student.email]);

  function handleStudentChange(e) {
    const { name, value } = e.target;
    setStudent((s) => ({ ...s, [name]: value }));
    setStudentErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleCourseChange(index, field, value) {
    setCourses((list) => {
      const copy = [...list];
      copy[index] = { ...copy[index], [field]: value };
      if (field === "courseName") {
        const meta = COURSES[value];
        if (meta) {
          const d = meta.durations[0] || "";
          copy[index].duration = d;
          copy[index].fee = meta.fees[d] ?? "";
        } else {
          copy[index].duration = "";
          copy[index].fee = "";
        }
      }
      if (field === "duration") {
        const courseName = copy[index].courseName;
        const meta = COURSES[courseName];
        if (meta) {
          copy[index].fee = meta.fees[value] ?? "";
        }
      }
      return copy;
    });
    setCourseErrors((prev) => ({ ...prev, [index]: undefined }));
  }

  function addCourse() {
    setCourses((c) => [...c, emptyCourse()]);
  }

  function removeCourse(index) {
    setCourses((c) => c.filter((_, i) => i !== index));
  }

  function validateStudent() {
    const errs = {};
    if (!student.name.trim()) errs.name = "Name is required";
    if (!student.email.trim()) errs.email = "Email is required";
    else if (!validateEmail(student.email)) errs.email = "Invalid email format";
    else if (emailExists) errs.email = "This email is already registered";
    if (!student.country) errs.country = "Country is required";
    if (!student.gender) errs.gender = "Please select a gender";
    setStudentErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateCourses() {
    const errs = {};
    courses.forEach((c, idx) => {
      const e = {};
      if (!c.courseName) e.courseName = "Select a course";
      if (!c.duration) e.duration = "Select duration";
      if (c.fee === "" || c.fee === null) e.fee = "Fee not set";
      if (Object.keys(e).length > 0) errs[idx] = e;
    });
    setCourseErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function goToStep2() {
    if (isCheckingEmail) return alert("Please wait while we verify the email.");
    const ok = validateStudent();
    if (!ok) return;
    setStep(2);
  }

  function goToReview() {
    const ok = validateCourses();
    if (!ok) return;
    setStep(3);
  }

  function resetForm() {
    setStudent(initialStudent);
    setCourses([emptyCourse()]);
    setStudentErrors({});
    setCourseErrors({});
    setEmailExists(null);
    setIsCheckingEmail(false);
    setSubmitted(false);
    setStep(1);
  }

  function handleConfirmSubmit() {
    fakeExistingEmails.current.push(student.email.trim().toLowerCase());
    setSubmitted(true);
    setTimeout(() => {
      resetForm();
    }, 1400);
  }

  function Stepper() {
    return (
      <div className="stepper">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`step ${step === s ? "active" : step > s ? "done" : ""}`}>
            <div className="circle">{s}</div>
            <div className="label">{s === 1 ? "Student" : s === 2 ? "Courses" : "Review"}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="app-root">
      <header className="hero">
        <h1>Online Course Enrollment</h1>
        <p className="subtitle">Dynamic fields, async validation, multi-step review</p>
      </header>
      <main className="container">
        <Stepper />
        <section className="card">
          {step === 1 && (
            <div className="step-content">
              <h2>Step 1 — Student Details</h2>
              <div className="form-grid">
                <label>
                  Name
                  <input name="name" value={student.name} onChange={handleStudentChange} placeholder="Full name" />
                  {studentErrors.name && <div className="error">{studentErrors.name}</div>}
                </label>
                <label>
                  Email
                  <input name="email" value={student.email} onChange={handleStudentChange} placeholder="you@domain.com" />
                  {isCheckingEmail && <div className="hint">Checking email...</div>}
                  {emailExists && <div className="error">Email already registered</div>}
                  {studentErrors.email && <div className="error">{studentErrors.email}</div>}
                </label>
                <label>
                  Country
                  <select name="country" value={student.country} onChange={handleStudentChange}>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {studentErrors.country && <div className="error">{studentErrors.country}</div>}
                </label>
                <fieldset className="radio-group">
                  <legend>Gender</legend>
                  {['Male','Female','Other'].map(g => (
                    <label key={g} className="inline">
                      <input type="radio" name="gender" value={g} checked={student.gender===g} onChange={handleStudentChange}/>{g}
                    </label>
                  ))}
                  {studentErrors.gender && <div className="error">{studentErrors.gender}</div>}
                </fieldset>
              </div>
              <div className="actions">
                <button className="btn primary" onClick={goToStep2} disabled={isCheckingEmail}>Next — Courses</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <h2>Step 2 — Course Selection</h2>
              <p className="hint">Add or remove courses, choose course name to auto-fill options.</p>
              {courses.map((c, idx) => (
                <div className="course-row" key={c.id}>
                  <div className="course-controls">
                    <label>
                      Course
                      <select value={c.courseName} onChange={(e) => handleCourseChange(idx, 'courseName', e.target.value)}>
                        <option value="">-- choose course --</option>
                        {Object.keys(COURSES).map((name) => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                      {courseErrors[idx]?.courseName && <div className="error">{courseErrors[idx].courseName}</div>}
                    </label>
                    <label>
                      Duration
                      <select value={c.duration} onChange={(e) => handleCourseChange(idx, 'duration', e.target.value)}>
                        <option value="">-- choose duration --</option>
                        {c.courseName && COURSES[c.courseName].durations.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      {courseErrors[idx]?.duration && <div className="error">{courseErrors[idx].duration}</div>}
                    </label>
                    <label>
                      Fees (INR)
                      <select value={c.fee} onChange={(e) => handleCourseChange(idx, 'fee', e.target.value)}>
                        <option value="">-- choose fee --</option>
                        {c.courseName && COURSES[c.courseName].durations.map((d) => (
                          <option key={d} value={COURSES[c.courseName].fees[d]}>{`₹ ${COURSES[c.courseName].fees[d]} (${d})`}</option>
                        ))}
                      </select>
                      {courseErrors[idx]?.fee && <div className="error">{courseErrors[idx].fee}</div>}
                    </label>
                  </div>
                  <div className="course-actions">
                    <button className="btn small" onClick={() => removeCourse(idx)} disabled={courses.length===1}>Remove</button>
                  </div>
                </div>
              ))}
              <div className="actions space-between">
                <button className="btn" onClick={() => setStep(1)}>Back</button>
                <div>
                  <button className="btn" onClick={addCourse}>Add Course</button>
                  <button className="btn primary" onClick={goToReview} style={{marginLeft:10}}>Review Enrollment</button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <h2>Step 3 — Review your data</h2>
              <div className="review-block">
                <h3>Student</h3>
                <div><strong>Name:</strong> {student.name}</div>
                <div><strong>Email:</strong> {student.email}</div>
                <div><strong>Country:</strong> {student.country}</div>
                <div><strong>Gender:</strong> {student.gender}</div>
              </div>
              <div className="review-block">
                <h3>Courses</h3>
                {courses.map((c, idx) => (
                  <div key={c.id} className="review-course">
                    <div><strong>#{idx+1}</strong> {c.courseName||'(no course)'}</div>
                    <div>Duration: {c.duration||'-'}</div>
                    <div>Fees: {c.fee?`₹ ${c.fee}`:'-'}</div>
                  </div>
                ))}
              </div>
              <div className="actions space-between">
                <button className="btn" onClick={() => setStep(2)}>Edit Courses</button>
                <div>
                  <button className="btn" onClick={() => setStep(1)}>Edit Student</button>
                  <button className="btn primary" onClick={handleConfirmSubmit} style={{marginLeft:10}}>Confirm & Submit</button>
                </div>
              </div>
              {submitted && <div className="success">Enrollment confirmed — form reset.</div>}
            </div>
          )}
        </section>
        <footer className="footer">Made with ❤️ — demo app (no real backend)</footer>
      </main>
    </div>
  );
}
