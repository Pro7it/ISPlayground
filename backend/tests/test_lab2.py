from app.core import md5
from pathlib import Path

def test_md5_empty():
    m = md5.MD5()
    m.update(b"")
    assert m.finalize() == "d41d8cd98f00b204e9800998ecf8427e"

def test_md5_a():
    m = md5.MD5()
    m.update(b"a")
    assert m.finalize() == "0cc175b9c0f1b6a831c399e269772661"

def test_md5_abc():
    m = md5.MD5()
    m.update(b"abc")
    assert m.finalize() == "900150983cd24fb0d6963f7d28e17f72"

def test_md5_message_digest():
    m = md5.MD5()
    m.update(b"message digest")
    assert m.finalize() == "f96b697d7cb7938d525a2f31aaf161d0"

def test_md5_alphabet():
    m = md5.MD5()
    m.update(b"abcdefghijklmnopqrstuvwxyz")
    assert m.finalize() == "c3fcd3d76192e4007dfb496cca67e13b"

def test_md5_semilong():
    m = md5.MD5()
    m.update(b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789")
    assert m.finalize() == "d174ab98d277d9f5a5611c2c9f419d9f"

def test_md5_long():
    m = md5.MD5()
    m.update(b"12345678901234567890123456789012345678901234567890123456789012345678901234567890")
    assert m.finalize() == "57edf4a22be3c955ac49da2e2107b67a"

def test_file():
    m = md5.MD5()
    file_path = Path(__file__).parent / "testfile.zip"
    with open(file_path, "rb") as file:
        while chunk := file.read(1024 * 1024):
            m.update(chunk)
    assert m.finalize() == "5373e1696d6f15258e04dec4f21539d6"