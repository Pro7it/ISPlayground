from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.lab1 import lab1
from app.core import md5
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/lab1")
async def run_lab1(
    count: int = Form(...),
    m: int = Form(2**29 - 1),
    a: int = Form(16**3),
    c: int = Form(6765),
    x0: int = Form(23)
):
    return lab1(count, m, a, c, x0)

@app.post("/api/lab2/generate/text")
async def generate_lab2_text(
    msg: str = Form("")
):
    m = md5.MD5()

    m.update(msg.encode())

    return {
        "hash": m.finalize()
    }

@app.post("/api/lab2/generate/file")
async def generate_lab2_file(
    file: UploadFile = File(...),
):
    m = md5.MD5()
    while chunk := await file.read(1024*1024):
        m.update(chunk)

    res_hash = m.finalize()

    return {
        "hash": res_hash,
    }
    
@app.post("/api/lab2/check")
async def check_lab2_file(
    file: UploadFile = File(...),
    hash: str = Form("")
):
    target_hash = hash.strip().lower()

    if not re.match(r"^[0-9a-f]{32}$", target_hash):
        raise HTTPException(
            status_code=400, 
            detail="Invalid MD5 hash format. Must be 32 hex characters."
        )

    m = md5.MD5()
    while chunk := await file.read(1024*1024):
        m.update(chunk)
    
    result_hash = m.finalize()

    is_valid = result_hash.lower() == target_hash

    return {
        "hash": result_hash,
        "is_valid": is_valid
    }