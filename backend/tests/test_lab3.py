from pathlib import Path
from app.core import rc5, md5
from app.core.lab1 import LCG

lcg = LCG()

def generate_key_from_password(password: str):
    m = md5.MD5()
    m.update(password.encode())
    h1 = bytes.fromhex(m.finalize())
    m.update(h1)
    h2 = bytes.fromhex(m.finalize())
    return h2 + h1

def test_rc5_empty_backend_style():
    password = "testkey12345678"
    key = generate_key_from_password(password)
    cipher = rc5.RC5(list(key))
    iv = lcg.generate_iv()
    data = b""
    encrypted = cipher.encrypt(list(data), list(iv))
    decrypted = bytes(cipher.decrypt(encrypted, list(iv)))
    assert decrypted == data

def test_rc5_short_text_backend_style():
    password = "mysecretkey1234"
    key = generate_key_from_password(password)
    cipher = rc5.RC5(list(key))
    iv = lcg.generate_iv()
    data = b"hello"
    encrypted = cipher.encrypt(list(data), list(iv))
    decrypted = bytes(cipher.decrypt(encrypted, list(iv)))
    assert decrypted == data

def test_rc5_block_size_text_backend_style():
    password = "anotherkey5678"
    key = generate_key_from_password(password)
    cipher = rc5.RC5(list(key))
    iv = lcg.generate_iv()
    data = b"12345678"
    encrypted = cipher.encrypt(list(data), list(iv))
    decrypted = bytes(cipher.decrypt(encrypted, list(iv)))
    assert decrypted == data

def test_rc5_multiple_blocks_backend_style():
    password = "longerkeyforrc5!"
    key = generate_key_from_password(password)
    cipher = rc5.RC5(list(key))
    iv = lcg.generate_iv()
    data = b"The quick brown fox jumps over the lazy dog."
    encrypted = cipher.encrypt(list(data), list(iv))
    decrypted = bytes(cipher.decrypt(encrypted, list(iv)))
    assert decrypted == data

def test_rc5_file_backend_style():
    password = "filekey12345678"
    key = generate_key_from_password(password)
    cipher = rc5.RC5(list(key))
    iv = lcg.generate_iv()
    file_path = Path(__file__).parent / "testfile.zip"
    with open(file_path, "rb") as f:
        data = f.read()
    encrypted = cipher.encrypt(list(data), list(iv))
    decrypted = bytes(cipher.decrypt(encrypted, list(iv)))
    assert decrypted == data