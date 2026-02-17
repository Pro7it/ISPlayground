from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.core.lab1 import generate

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Lab1Request(BaseModel):
    count: int

@app.post("/api/lab1")
def run_lab1(request: Lab1Request):
    return generate(request.count)
