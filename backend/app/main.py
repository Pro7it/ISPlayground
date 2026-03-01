from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
from app.core.lab1 import lab1
from app.core.lab2 import lab2, MD5

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
async def generate_lab2_file(
    msg: str = Form(None)
):
    return lab2(msg)

@app.post("/api/lab2/generate/file")
async def generate_lab2_text(
    file: UploadFile = File(...),
):
    m = MD5()
    while chunk := await file.read(1024*1024):
        m.update(chunk)

    res_hash = m.finalize()

    return {
        "hash": res_hash,
    }
    
@app.post("/api/lab2/check")
async def check_lab2_file(
    file: UploadFile = File(...),
    hash: str = Form(None)
):
    m = MD5()
    while chunk := await file.read(1024 * 1024 * 64):
        m.update(chunk)
    
    result_hash = m.finalize()

    is_valid = result_hash.lower() == hash.strip().lower()

    return {
        "hash": result_hash,
        "is_valid": is_valid
    }