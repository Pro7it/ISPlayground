import pytest
import io
from app.core.lab4 import RSA

class AsyncBytesIO:
    def __init__(self, b=b""):
        self.obj = io.BytesIO(b)
    async def read(self, n=-1):
        return self.obj.read(n)

def test_rsa_generate_keys_returns_bytes():
    rsa_inst = RSA()
    priv, pub = rsa_inst.generate_keys()
    assert isinstance(priv, bytes)
    assert isinstance(pub, bytes)
    assert b"BEGIN PRIVATE KEY" in priv
    assert b"BEGIN PUBLIC KEY" in pub


def test_rsa_load_keys_success():
    rsa_inst = RSA()
    priv, pub = rsa_inst.generate_keys()
    rsa_inst.load_private_key(priv)
    rsa_inst.load_public_key(pub)
    assert rsa_inst.private_key is not None
    assert rsa_inst.public_key is not None


@pytest.mark.anyio
async def test_rsa_encrypt_stream_returns_data():
    rsa_inst = RSA()
    priv, pub = rsa_inst.generate_keys()
    rsa_inst.load_public_key(pub)
    
    data = b"Hello World"
    file_in = AsyncBytesIO(data)
    
    chunks = []
    async for chunk in rsa_inst.encrypt_stream(file_in):
        chunks.append(chunk)
    
    encrypted_data = b"".join(chunks)
    assert len(encrypted_data) > 0
    assert encrypted_data != data


@pytest.mark.anyio
async def test_rsa_full_cycle_integrity():
    rsa_inst = RSA()
    priv, pub = rsa_inst.generate_keys()
    rsa_inst.load_private_key(priv)
    rsa_inst.load_public_key(pub)
    
    original_data = b"Secret message for RSA test"
    file_in = AsyncBytesIO(original_data)
    
    enc_chunks = []
    async for chunk in rsa_inst.encrypt_stream(file_in):
        enc_chunks.append(chunk)
    
    file_enc = AsyncBytesIO(b"".join(enc_chunks))
    dec_chunks = []
    async for chunk in rsa_inst.decrypt_stream(file_enc):
        dec_chunks.append(chunk)
        
    assert b"".join(dec_chunks) == original_data


@pytest.mark.anyio
async def test_rsa_encrypt_large_file_multiple_chunks():
    rsa_inst = RSA()
    priv, pub = rsa_inst.generate_keys()
    rsa_inst.load_private_key(priv)
    rsa_inst.load_public_key(pub)
    
    large_data = b"A" * 300 
    file_in = AsyncBytesIO(large_data)
    
    enc_chunks = []
    async for chunk in rsa_inst.encrypt_stream(file_in):
        enc_chunks.append(chunk)
        
    file_enc = AsyncBytesIO(b"".join(enc_chunks))
    dec_chunks = []
    async for chunk in rsa_inst.decrypt_stream(file_enc):
        dec_chunks.append(chunk)
        
    assert b"".join(dec_chunks) == large_data


@pytest.mark.anyio
async def test_rsa_encrypt_raises_without_key():
    rsa_inst = RSA()
    file_in = AsyncBytesIO(b"test")
    with pytest.raises(ValueError, match="Публічний ключ не завантажений"):
        async for _ in rsa_inst.encrypt_stream(file_in):
            pass


@pytest.mark.anyio
async def test_rsa_decrypt_raises_without_key():
    rsa_inst = RSA()
    file_in = AsyncBytesIO(b"encrypted_stuff")
    with pytest.raises(ValueError, match="Приватний ключ не завантажений"):
        async for _ in rsa_inst.decrypt_stream(file_in):
            pass


@pytest.mark.anyio
async def test_rsa_encrypt_empty_file():
    rsa_inst = RSA()
    _, pub = rsa_inst.generate_keys()
    rsa_inst.load_public_key(pub)
    
    file_in = AsyncBytesIO(b"")
    chunks = []
    async for chunk in rsa_inst.encrypt_stream(file_in):
        chunks.append(chunk)
    
    assert len(chunks) == 0