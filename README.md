# VT Course Planner

A full-stack course planning application for Virginia Tech students to organize future semesters, track credit loads, and validate course prerequisites.

## Features

- Search available courses by course code or name
- Add courses to specific semesters
- Remove courses from a degree plan
- Calculate semester credit totals
- Validate prerequisites before allowing a course to be added
- Prevent duplicate courses
- Save degree plans using browser localStorage
- Clear an entire degree plan

## Tech Stack

### Frontend
- React
- JavaScript
- CSS
- Vite

### Backend
- Python
- FastAPI
- REST API

## How It Works

The React frontend requests course data from the FastAPI backend through the `/courses` API endpoint.

The backend returns course information including:

- Course code
- Course name
- Credit hours
- Prerequisites

The frontend then allows users to organize those courses into semesters and checks whether prerequisite courses were completed in an earlier semester.

## Running the Project Locally

### Backend

From the project directory:

```bash
cd backend