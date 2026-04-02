from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from app.core.lab1 import LCG
from app.core import md5, rc5
# from app.core.lab3 import RC5
import re

CHUNK_SIZE = 1 * 1024 * 1024  # 1 MB

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
    while chunk := await file.read(CHUNK_SIZE):
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
    while chunk := await file.read(CHUNK_SIZE):
        m.update(chunk)
    
    result_hash = m.finalize()

    is_valid = result_hash.lower() == target_hash

    return {
        "hash": result_hash,
        "is_valid": is_valid
    }


def derive_key(password):
    m = md5.MD5()
    m.update(password.encode())
    h1 = bytes.fromhex(m.finalize())
    m.update(h1)
    h2 = bytes.fromhex(m.finalize())
    return h2 + h1

def iv_to_ints(iv):
    return (
        int.from_bytes(iv[:4], 'little'),
        int.from_bytes(iv[4:], 'little'),
    )

@app.post("/api/lab3/encrypt")
async def encrypt_file(file: UploadFile = File(...), password: str = Form(...)):
    key = derive_key(password)
    r = rc5.RC5(key)
    iv = bytes(LCG().generate_iv())
    iv_encrypted = r.encrypt_ecb(iv)
    prevA, prevB = iv_to_ints(iv)

    async def generate():
        def pad(data, block_size=8): # для останнього блоку
            pad_len = block_size - (len(data) % block_size)
            if pad_len == 0:
                pad_len = block_size
            return data + bytes([pad_len] * pad_len)
        
        nonlocal prevA, prevB
        yield iv_encrypted

        leftover = b""
        while True:
            chunk = await file.read(CHUNK_SIZE)
            if not chunk:
                break
            buf = leftover + chunk
            remainder = len(buf) % 8
            leftover = buf[-remainder:] if remainder else b"" # якщо щось лишилось
            buf = buf[:-remainder] if remainder else buf # сам блок даних
            if buf:
                encrypted, prevA, prevB = r.encrypt(buf, prevA, prevB)
                yield encrypted

        padded = pad(leftover if leftover else b"") # додаємо падинг, навіть якщо нічого нема
        encrypted, prevA, prevB = r.encrypt(padded, prevA, prevB)
        yield encrypted

    return StreamingResponse(
        generate(),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename=res.enc"}
    )

@app.post("/api/lab3/decrypt")
async def decrypt_file(file: UploadFile = File(...), password: str = Form(...)):
    data = await file.read()
    key = derive_key(password)
    r = rc5.RC5(key)

    iv_encrypted, encrypted_data = data[:8], data[8:] # забираємо наш iv
    iv = r.decrypt_ecb(iv_encrypted) # і дешифруємо його

    prevA, prevB = iv_to_ints(iv)

    async def generate():
        nonlocal prevA, prevB
        total = len(encrypted_data)
        offset = 0
        while offset < total:
            end = min(offset + CHUNK_SIZE, total) # скільки ще лишилось
            chunk = encrypted_data[offset:end]
            is_last = (end == total)
            decrypted, prevA, prevB = r.decrypt(chunk, prevA, prevB, is_last)
            yield decrypted
            offset = end

    return StreamingResponse(
        generate(),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename=res"}
    )