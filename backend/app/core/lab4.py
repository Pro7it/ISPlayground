from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
import sys
import traceback

CHUNK_SIZE = 190  # Максимальний розмір блоку для RSA-2048 з OAEP SHA-256
IO_BUFFER = 64 * 1024 # 64KB буфер для читання з диска

class RSA:
    def __init__(self):
        self.private_key = None
        self.public_key = None

    def generate_keys(self):
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        public_key = private_key.public_key()
        private_bytes = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        public_bytes = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        return private_bytes, public_bytes

    def load_public_key(self, key_bytes):
        self.public_key = serialization.load_pem_public_key(key_bytes)

    def load_private_key(self, key_bytes):
        self.private_key = serialization.load_pem_private_key(key_bytes, password=None)

    async def _read_exactly(self, file, n):
        """Надійно читає рівно n байтів з асинхронного потоку."""
        data = b""
        while len(data) < n:
            chunk = await file.read(n - len(data))
            if not chunk:
                break
            data += chunk
        return data

    async def encrypt_stream(self, file):
        if not self.public_key:
            raise ValueError("Публічний ключ не завантажений")

        print("Starting RSA encryption...", file=sys.stderr)
        try:
            processed = 0
            while True:
                # Читаємо великий буфер, щоб не смикати диск на кожні 190 байт
                buffer = await file.read(IO_BUFFER)
                if not buffer:
                    break
                
                for i in range(0, len(buffer), CHUNK_SIZE):
                    chunk = buffer[i:i + CHUNK_SIZE]
                    encrypted = self.public_key.encrypt(
                        chunk,
                        padding.OAEP(
                            mgf=padding.MGF1(algorithm=hashes.SHA256()),
                            algorithm=hashes.SHA256(),
                            label=None
                        )
                    )
                    yield len(encrypted).to_bytes(4, 'big')
                    yield encrypted
                
                processed += len(buffer)
                if processed % (1024 * 1024) == 0: # Лог кожний 1МБ
                    print(f"Encrypted {processed // (1024*1024)} MB...", file=sys.stderr)
            
            print("Encryption finished successfully.", file=sys.stderr)
        except Exception as e:
            print(f"Error during encryption: {e}", file=sys.stderr)
            traceback.print_exc()
            raise

    async def decrypt_stream(self, file):
        if not self.private_key:
            raise ValueError("Приватний ключ не завантажений")

        print("Starting RSA decryption...", file=sys.stderr)
        try:
            processed_chunks = 0
            while True:
                length_bytes = await self._read_exactly(file, 4)
                if not length_bytes:
                    break

                if len(length_bytes) < 4:
                    print("Error: Incomplete length header", file=sys.stderr)
                    break

                length = int.from_bytes(length_bytes, 'big')
                encrypted_chunk = await self._read_exactly(file, length)
                
                if len(encrypted_chunk) < length:
                    print(f"Error: Expected {length} bytes, got {len(encrypted_chunk)}", file=sys.stderr)
                    break

                decrypted = self.private_key.decrypt(
                    encrypted_chunk,
                    padding.OAEP(
                        mgf=padding.MGF1(algorithm=hashes.SHA256()),
                        algorithm=hashes.SHA256(),
                        label=None
                    )
                )
                yield decrypted
                
                processed_chunks += 1
                if processed_chunks % 1000 == 0:
                    print(f"Decrypted {processed_chunks} blocks...", file=sys.stderr)

            print("Decryption finished successfully.", file=sys.stderr)
        except Exception as e:
            print(f"Error during decryption: {e}", file=sys.stderr)
            traceback.print_exc()
            raise