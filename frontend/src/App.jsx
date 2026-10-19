import { useEffect, useState } from "react"
import "./App.css"

const semesters = [
  "Fall 2026",
  "Spring 2027",
  "Fall 2027",
  "Spring 2028",
  "Fall 2028",
  "Spring 2029"
]

function App() {
  const [courses, setCourses] = useState([])
  const [plannedCourses, setPlannedCourses] = useState(() => {
    const savedPlan = localStorage.getItem("vt-course-plan")

    return savedPlan ? JSON.parse(savedPlan) : []
  })
  const [completedCourses, setCompletedCourses] = useState(() => {
    const saved = localStorage.getItem("vt-completed-courses")

    return saved ? JSON.parse(saved) : []
  })
  const [selectedSemester, setSelectedSemester] = useState("Fall 2026")
  const [searchTerm, setSearchTerm] = useState("")
  const [onlyEligible, setOnlyEligible] = useState(false)
  const [bulkText, setBulkText] = useState("")

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "https://vt-course-planner-api.onrender.com"}/courses`)
      .then((response) => response.json())
      .then((data) => setCourses(data))
      .catch((error) => console.error("Error fetching courses:", error))
  }, [])

  useEffect(() => {
    localStorage.setItem("vt-course-plan", JSON.stringify(plannedCourses))
  }, [plannedCourses])

  useEffect(() => {
    localStorage.setItem(
      "vt-completed-courses",
      JSON.stringify(completedCourses)
    )
  }, [completedCourses])

  const selectedSemesterIndex = semesters.indexOf(selectedSemester)

  function isTaken(code) {
    return completedCourses.some((course) => course.code === code)
  }

  function isPlanned(code) {
    return plannedCourses.some((course) => course.code === code)
  }

  // A prerequisite is met if the course was already taken,
  // or is planned in a semester before the one being checked
  function isSatisfied(code, semesterIndex) {
    return (
      isTaken(code) ||
      plannedCourses.some(
        (planned) =>
          planned.code === code &&
          semesters.indexOf(planned.semester) < semesterIndex
      )
    )
  }

  function getMissingPrerequisites(course, semesterIndex) {
    return course.prerequisites
      .filter((group) => {
        const options = Array.isArray(group) ? group : [group]
        return !options.some((code) => isSatisfied(code, semesterIndex))
      })
      .map((group) => (Array.isArray(group) ? group.join(" or ") : group))
  }

  function addCourse(course) {
    if (isPlanned(course.code)) {
      return
    }

    if (isTaken(course.code)) {
      alert(`${course.code} is already marked as taken.`)
      return
    }

    const missingPrerequisites = getMissingPrerequisites(
      course,
      selectedSemesterIndex
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

  function markTaken(course) {
    if (isTaken(course.code)) {
      return
    }

    // If it was in the plan, it is no longer needed there
    setPlannedCourses((current) =>
      current.filter((planned) => planned.code !== course.code)
    )
    setCompletedCourses((current) => [
      ...current,
      {
        code: course.code,
        name: course.name,
        credits: course.credits,
        prerequisites: course.prerequisites
      }
    ])
  }

  function unmarkTaken(courseCode) {
    setCompletedCourses(
      completedCourses.filter((course) => course.code !== courseCode)
    )
  }

  // Add many taken courses at once, e.g. "CS 1114, CS 2114, MATH 1225"
  function addBulk() {
    const matches = bulkText.match(/[A-Za-z]{2,5}\s?\d{4}[A-Za-z]?/g) || []
    const codes = [
      ...new Set(
        matches.map((text) => {
          const clean = text.replace(/\s/g, "").toUpperCase()
          return clean.replace(/^([A-Z]+)(\d{4}[A-Z]?)$/, "$1 $2")
        })
      )
    ]

    const found = []
    const notFound = []

    codes.forEach((code) => {
      const course = courses.find((c) => c.code === code)

      if (course) {
        found.push(course)
      } else {
        notFound.push(code)
      }
    })

    const newOnes = found.filter((course) => !isTaken(course.code))
    const newCodes = newOnes.map((course) => course.code)

    setPlannedCourses((current) =>
      current.filter((planned) => !newCodes.includes(planned.code))
    )
    setCompletedCourses((current) => [
      ...current,
      ...newOnes.map((course) => ({
        code: course.code,
        name: course.name,
        credits: course.credits,
        prerequisites: course.prerequisites
      }))
    ])
    setBulkText("")

    if (notFound.length > 0) {
      alert(`Couldn't find: ${notFound.join(", ")}`)
    }
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

  const takenCredits = completedCourses.reduce(
    (total, course) => total + course.credits,
    0
  )

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = `${course.code} ${course.name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    if (!matchesSearch) {
      return false
    }

    if (onlyEligible) {
      return (
        !isTaken(course.code) &&
        !isPlanned(course.code) &&
        getMissingPrerequisites(course, selectedSemesterIndex).length === 0
      )
    }

    return true
  })

  return (
    <div>
      <h1>VT Course Planner</h1>
      <p>Plan your Virginia Tech courses and track your degree progress.</p>

      <h2>Courses Already Taken</h2>

      <div className="semester-card">
        <div className="semester-header">
          <h3>Completed</h3>
          <span>{takenCredits} credits</span>
        </div>

        <div className="course-controls">
          <input
            type="text"
            placeholder="Paste codes: CS 1114, CS 2114, MATH 1225"
            value={bulkText}
            onChange={(event) => setBulkText(event.target.value)}
          />
          <button onClick={addBulk}>Add taken courses</button>
        </div>

        {completedCourses.length === 0 ? (
          <p>
            No courses marked as taken. Paste codes above, or use the Taken
            button in the course list below.
          </p>
        ) : (
          <ul>
            {completedCourses.map((course) => (
              <li key={course.code}>
                {course.code} - {course.name} ({course.credits} credits){" "}
                <button onClick={() => unmarkTaken(course.code)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>

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

        <label className="semester-control">
          <input
            type="checkbox"
            checked={onlyEligible}
            onChange={(event) => setOnlyEligible(event.target.checked)}
          />{" "}
          Only show courses I can add
        </label>
      </div>

      {onlyEligible && (
        <p>
          Showing courses whose prerequisites are met by your taken courses and
          anything planned before {selectedSemester}.
        </p>
      )}

      {filteredCourses.length > 50 && (
        <p>
          Showing 50 of {filteredCourses.length} courses. Keep typing to narrow
          it down (try a subject like CS or MATH).
        </p>
      )}

      <ul>
        {filteredCourses.slice(0, 50).map((course) => (
          <li key={course.code}>
            {course.code} - {course.name} ({course.credits} credits){" "}
            {isTaken(course.code) ? (
              <strong>✓ Taken</strong>
            ) : (
              <>
                <button onClick={() => addCourse(course)}>Add</button>{" "}
                <button onClick={() => markTaken(course)}>Taken</button>
              </>
            )}
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

          {plannedCourses.filter((course) => course.semester === semester)
            .length === 0 ? (
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
