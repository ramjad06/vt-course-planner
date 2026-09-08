from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://vt-course-planner.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

courses = [
    {
        "code": "CS 1114",
        "name": "Introduction to Computing",
        "credits": 3,
        "prerequisites": []
    },
    {
        "code": "CS 2114",
        "name": "Data Structures and Algorithms",
        "credits": 3,
        "prerequisites": ["CS 1114"]
    },
    {
        "code": "CS 3114",
        "name": "Software Engineering",
        "credits": 3,
        "prerequisites": ["CS 2114"]
    },
    {
        "code": "CS 4114",
        "name": "Operating Systems",
        "credits": 3,
        "prerequisites": ["CS 3114"]
    }
]

@app.get("/")
def home():
    return {"message": "VT Course Planner backend is running"}

@app.get("/courses")
def get_courses():
    return courses