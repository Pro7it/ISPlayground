import pytest
import io
from app.core.lab5 import DSA

class AsyncBytesIO:
    def __init__(self, b=b""):
        self.obj = io.BytesIO(b)
    async def read(self, n=-1):
        return self.obj.read(n)

def test_dsa_generate_keys_returns_bytes():
    dsa_inst = DSA()
    priv, pub = dsa_inst.generate_keys()
    assert isinstance(priv, bytes)
    assert isinstance(pub, bytes)
    assert b"BEGIN PRIVATE KEY" in priv
    assert b"BEGIN PUBLIC KEY" in pub

def test_dsa_load_keys_success():
    dsa_inst = DSA()
    priv, pub = dsa_inst.generate_keys()
    dsa_inst.load_private_key(priv)
    dsa_inst.load_public_key(pub)
    assert dsa_inst.private_key is not None
    assert dsa_inst.public_key is not None

def test_dsa_sign_and_verify_data():
    dsa_inst = DSA()
    priv, pub = dsa_inst.generate_keys()
    dsa_inst.load_private_key(priv)
    dsa_inst.load_public_key(pub)
    
    data = b"Hello DSA world"
    signature = dsa_inst.sign_data(data)
    assert isinstance(signature, bytes)
    
    is_valid = dsa_inst.verify_data(data, signature)
    assert is_valid is True

def test_dsa_verify_data_invalid_signature():
    dsa_inst = DSA()
    priv, pub = dsa_inst.generate_keys()
    dsa_inst.load_private_key(priv)
    dsa_inst.load_public_key(pub)
    
    data = b"Hello DSA world"
    signature = dsa_inst.sign_data(data)
    
    # Modify data to make signature invalid
    is_valid = dsa_inst.verify_data(data + b"modified", signature)
    assert is_valid is False

@pytest.mark.anyio
async def test_dsa_sign_and_verify_stream():
    dsa_inst = DSA()
    priv, pub = dsa_inst.generate_keys()
    dsa_inst.load_private_key(priv)
    dsa_inst.load_public_key(pub)
    
    data = b"Large data stream simulation" * 100
    file_in_sign = AsyncBytesIO(data)
    signature = await dsa_inst.sign_stream(file_in_sign)
    assert isinstance(signature, bytes)
    
    file_in_verify = AsyncBytesIO(data)
    is_valid = await dsa_inst.verify_stream(file_in_verify, signature)
    assert is_valid is True

@pytest.mark.anyio
async def test_dsa_verify_stream_invalid_signature():
    dsa_inst = DSA()
    priv, pub = dsa_inst.generate_keys()
    dsa_inst.load_private_key(priv)
    dsa_inst.load_public_key(pub)
    
    data = b"Large data stream simulation"
    file_in_sign = AsyncBytesIO(data)
    signature = await dsa_inst.sign_stream(file_in_sign)
    
    file_in_verify = AsyncBytesIO(data + b"corrupted")
    is_valid = await dsa_inst.verify_stream(file_in_verify, signature)
    assert is_valid is False

def test_dsa_sign_raises_without_key():
    dsa_inst = DSA()
    with pytest.raises(ValueError, match="Приватний ключ не завантажено"):
        dsa_inst.sign_data(b"test")

def test_dsa_verify_raises_without_key():
    dsa_inst = DSA()
    with pytest.raises(ValueError, match="Публічний ключ не завантажено"):
        dsa_inst.verify_data(b"test", b"fake_sig")
