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
        "name": "Introduction to Software Design",
        "credits": 3,
        "prerequisites": []
    },
    {
        "code": "CS 2114",
        "name": "Software Design and Data Structures",
        "credits": 3,
        "prerequisites": ["CS 1114"]
    },
    {
        "code": "CS 2104",
        "name": "Introduction to Problem Solving in Computer Science",
        "credits": 3,
        "prerequisites": ["CS 1114"]
    },
    {
        "code": "CS 2505",
        "name": "Introduction to Computer Organization",
        "credits": 3,
        "prerequisites": ["CS 2114"]
    },
    {
        "code": "CS 2506",
        "name": "Introduction to Computer Organization",
        "credits": 3,
        "prerequisites": ["CS 2114", "CS 2505"]
    },
    {
        "code": "CS 3114",
        "name": "Data Structures and Algorithms",
        "credits": 3,
        "prerequisites": ["CS 2114", "CS 2505"]
    },
    {
        "code": "CS 3214",
        "name": "Computer Systems",
        "credits": 3,
        "prerequisites": ["CS 2114", "CS 2506"]
    },
    {
        "code": "CS 3304",
        "name": "Comparative Languages",
        "credits": 3,
        "prerequisites": ["CS 3114"]
    },
    {
        "code": "CS 3314",
        "name": "Programming Language Theory and Practice",
        "credits": 3,
        "prerequisites": ["CS 3114"]
    },
    {
        "code": "CS 3704",
        "name": "Intermediate Software Design and Engineering",
        "credits": 3,
        "prerequisites": ["CS 2114"]
    }
]

@app.get("/")
def home():
    return {"message": "VT Course Planner backend is running"}

@app.get("/courses")
def get_courses():
    return courses