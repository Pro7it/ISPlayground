from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from app.core.lab1 import LCG
from app.core import md5, rc5
# from app.core.lab3 import RC5
import re
import io

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
    try:
        lcg = LCG(seed=x0, m=m, a=a, c=c)

        numbers = lcg.generate(count)
        period = lcg.period()
        pi_my = lcg.estimate_pi(count)
        pi_sys = lcg.estimate_pi_system(count)

        return {
            "numbers": numbers,
            "period": period,
            "pi_est_my": pi_my,
            "pi_est_sys": pi_sys,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

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

@app.post("/api/lab3/encrypt")
async def encrypt_file(
    file: UploadFile = File(...),
    password: str = Form(...)
):
    data = await file.read()

    m = md5.MD5()
    m.update(password.encode())
    h1 = bytes.fromhex(m.finalize())
    m.update(h1)
    h2 = bytes.fromhex(m.finalize())
    key = h2 + h1

    lcg = LCG()
    iv = lcg.generate_iv()

    r = rc5.RC5(list(key))
    encrypted = r.encrypt(list(data), list(iv))

    encrypted_with_iv = bytes(iv) + bytes(encrypted)

    return StreamingResponse(
        io.BytesIO(encrypted_with_iv),
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f"attachment; filename={file.filename}.enc"
        }
    )

@app.post("/api/lab3/decrypt")
async def decrypt_file(
    file: UploadFile = File(...),
    password: str = Form(...)
):
    data = await file.read()
    if len(data) < 8:
        raise HTTPException(status_code=400, detail="Файл закороткий, аби містити IV")

    iv = list(data[:8])
    encrypted_data = list(data[8:])

    m = md5.MD5()
    m.update(password.encode())
    h1 = bytes.fromhex(m.finalize())
    m.update(h1)
    h2 = bytes.fromhex(m.finalize())
    key = h2 + h1

    try:
        r = rc5.RC5(list(key))
        decrypted = r.decrypt(encrypted_data, iv)
    except Exception:
        raise HTTPException(status_code=400, detail="Розшифрування провалено")

    filename = file.filename.replace(".enc", "")

    return StreamingResponse(
        io.BytesIO(bytes(decrypted)),
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )