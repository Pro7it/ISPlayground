from pathlib import Path
from app.core.lab3 import RC5

def test_rc5_empty():
    password = "testkey12345678"
    cipher = RC5(password)
    data = b""
    encrypted = cipher.encrypt(data)
    decrypted = cipher.decrypt(encrypted)
    assert decrypted == data

def test_rc5_short_text():
    password = "mysecretkey1234"
    cipher = RC5(password)
    data = b"hello"
    encrypted = cipher.encrypt(data)
    decrypted = cipher.decrypt(encrypted)
    assert decrypted == data

def test_rc5_block_size_text():
    password = "anotherkey5678"
    cipher = RC5(password)
    data = b"12345678"
    encrypted = cipher.encrypt(data)
    decrypted = cipher.decrypt(encrypted)
    assert decrypted == data

def test_rc5_multiple_blocks():
    password = "longerkeyforrc5!"
    cipher = RC5(password)
    data = b"The quick brown fox jumps over the lazy dog."
    encrypted = cipher.encrypt(data)
    decrypted = cipher.decrypt(encrypted)
    assert decrypted == data

def test_rc5_file():
    password = "filekey12345678"
    cipher = RC5(password)
    file_path = Path(__file__).parent / "testfile.zip"
    with open(file_path, "rb") as f:
        data = f.read()
    
    encrypted = cipher.encrypt(data)
    decrypted = cipher.decrypt(encrypted)
    assert decrypted == data
