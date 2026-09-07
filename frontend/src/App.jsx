import { useEffect, useState } from "react"
import "./App.css"

function App() {
  const [courses, setCourses] = useState([])
  const [plannedCourses, setPlannedCourses] = useState(() => {
    const savedPlan = localStorage.getItem("vt-course-plan")

    return savedPlan ? JSON.parse(savedPlan) : []
  })
  const [selectedSemester, setSelectedSemester] = useState("Fall 2026")
  const [searchTerm, setSearchTerm] = useState("")

  const semesters = [
  "Fall 2026",
  "Spring 2027",
  "Fall 2027",
  "Spring 2028",
  "Fall 2028",
  "Spring 2029"
  ]

  useEffect(() => {
    fetch("http://127.0.0.1:8000/courses")
      .then((response) => response.json())
      .then((data) => setCourses(data))
      .catch((error) => console.error("Error fetching courses:", error))
  }, [])

  useEffect(() => {
  localStorage.setItem(
    "vt-course-plan",
    JSON.stringify(plannedCourses)
  )
}, [plannedCourses])

function addCourse(course) {
  const alreadyAdded = plannedCourses.some(
    (planned) => planned.code === course.code
  )

  if (alreadyAdded) {
    return
  }

  const selectedSemesterIndex = semesters.indexOf(selectedSemester)

  const missingPrerequisites = course.prerequisites.filter(
    (prerequisite) => {
      return !plannedCourses.some((planned) => {
        const plannedSemesterIndex = semesters.indexOf(planned.semester)

        return (
          planned.code === prerequisite &&
          plannedSemesterIndex < selectedSemesterIndex
        )
      })
    }
  )

  if (missingPrerequisites.length > 0) {
    alert(`Missing prerequisite(s): ${missingPrerequisites.join(", ")}`)
    return
  }

  setPlannedCourses([
    ...plannedCourses,
    {
      ...course,
      semester: selectedSemester
    }
  ])
}

  // Remove a course from the planned courses
  function removeCourse(courseCode) {
    setPlannedCourses(
      plannedCourses.filter((course) => course.code !== courseCode)
    )
  }

  function clearPlan() {
    const confirmed = window.confirm(
      "Are you sure you want to clear your entire degree plan?"
    )

    if (confirmed) {
      setPlannedCourses([])
    }
  }

  function getSemesterCredits(semester) {
    return plannedCourses
      .filter((course) => course.semester === semester)
      .reduce((total, course) => total + course.credits, 0)
  }

  const filteredCourses = courses.filter((course) =>
    `${course.code} ${course.name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <h1>VT Course Planner</h1>
      <p>Plan your Virginia Tech courses and track your degree progress.</p>

      <h2>Available Courses</h2>

      <div className="course-controls">
  <input
    type="text"
    placeholder="Search courses..."
    value={searchTerm}
    onChange={(event) => setSearchTerm(event.target.value)}
  />

  <label className="semester-control">
    Add courses to:
    <select
      value={selectedSemester}
      onChange={(event) => setSelectedSemester(event.target.value)}
    >
      {semesters.map((semester) => (
        <option key={semester} value={semester}>
          {semester}
        </option>
      ))}
    </select>
  </label>
</div>

      <ul>
        {filteredCourses.map((course) => (
          <li key={course.code}>
            {course.code} - {course.name} ({course.credits} credits){" "}
            <button onClick={() => addCourse(course)}>Add</button>
          </li>
        ))}
      </ul>

      <div className="plan-title">
        <h2>My Degree Plan</h2>

        <button className="clear-button" onClick={clearPlan}>
          Clear Plan
        </button>
      </div>

      {semesters.map((semester) => (
        <div key={semester} className="semester-card">
          <div className="semester-header">
  <h3>{semester}</h3>
  <span>{getSemesterCredits(semester)} credits</span>
</div>

          {plannedCourses.filter(
            (course) => course.semester === semester
          ).length === 0 ? (
            <p>No courses added.</p>
          ) : (
            <ul>
              {plannedCourses
                .filter((course) => course.semester === semester)
                .map((course) => (
                  <li key={course.code}>
                    {course.code} - {course.name} ({course.credits} credits){" "}
                    <button onClick={() => removeCourse(course.code)}>
                      Remove
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

export default App