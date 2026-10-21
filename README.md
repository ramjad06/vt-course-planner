VT Course Planner
A full-stack course planning app for Virginia Tech students to map out semesters, track credits, and check prerequisites across the full VT undergraduate catalog.
Live demo: https://vt-course-planner.vercel.app
Features
Search 7,500+ VT courses by code or name
Plan courses by semester (Fall 2026 – Spring 2029)
Prerequisite validation that supports "or" alternatives (e.g. `CS 2114 or ECE 3514`)
Mark courses you've already taken, so they count as completed prerequisites
"Only show courses I can add" filter based on your taken and planned courses
Duplicate-course prevention
Per-semester credit totals
Plan and taken courses saved in your browser (localStorage)
Clear your entire plan in one click
Tech Stack
Frontend: React, JavaScript, CSS, Vite (deployed on Vercel)
Backend: Python, FastAPI, REST API (deployed on Render)
How It Works
The FastAPI backend loads `backend/courses.json` and serves it from the `/courses` endpoint.
The React frontend fetches the course list and lets users add courses to semesters or mark them as taken.
Each course stores its prerequisites as groups: every group must be satisfied, and a group is satisfied if any course in it is taken or planned in an earlier semester.
Example from `courses.json`:
```json
{
  "code": "CS 3114",
  "name": "Data Structures and Algorithms",
  "credits": 3,
  "prerequisites": [["CS 2114", "ECE 3514"], ["CS 2505", "ECE 2564"], ["MATH 2534", "MATH 3034"]]
}
```
Course Data
`courses.json` was built from the 2026–2027 VT undergraduate catalog (catalog.vt.edu). Prerequisite text was parsed into the group format above. Non-course requirements (consent, standing, etc.) are saved as a `prereq_note` and are not enforced. Courses with variable credits count as their minimum credit value.
Running the Project Locally
Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
The API runs at http://127.0.0.1:8000 (see `/courses`).
Frontend
```bash
cd frontend
npm install
npm run dev
```
The app runs at http://localhost:5173. To use a local backend, create `frontend/.env` with:
```
VITE_API_URL=http://127.0.0.1:8000
```
Limitations
Does not enforce non-course prerequisites or corequisites
Does not check which semesters a course is offered
Catalog data is for one year and needs to be regenerated when VT publishes a new catalog
