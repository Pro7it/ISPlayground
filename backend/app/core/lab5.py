from cryptography.hazmat.primitives.asymmetric import dsa
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives.asymmetric import utils

class DSA:
    def __init__(self):
        self.private_key = None
        self.public_key = None

    def generate_keys(self):
        private_key = dsa.generate_private_key(
            key_size=1024
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

    def load_private_key(self, key_bytes: bytes):
        self.private_key = serialization.load_pem_private_key(key_bytes, password=None)

    def load_public_key(self, key_bytes: bytes):
        self.public_key = serialization.load_pem_public_key(key_bytes)

    def sign_data(self, data: bytes) -> bytes:
        if not self.private_key:
            raise ValueError("Приватний ключ не завантажено")
        signature = self.private_key.sign(
            data,
            hashes.SHA256()
        )
        return signature

    async def sign_stream(self, stream) -> bytes:
        if not self.private_key:
            raise ValueError("Приватний ключ не завантажено")

        hasher = hashes.Hash(hashes.SHA256())
        while chunk := await stream.read(64 * 1024):
            hasher.update(chunk)
        digest = hasher.finalize()

        signature = self.private_key.sign(
            digest,
            utils.Prehashed(hashes.SHA256())
        )
        return signature

    def verify_data(self, data: bytes, signature: bytes):
        if not self.public_key:
            raise ValueError("Публічний ключ не завантажено")
        try:
            self.public_key.verify(
                signature,
                data,
                hashes.SHA256()
            )
            return True
        except InvalidSignature:
            return False

    async def verify_stream(self, stream, signature: bytes):
        if not self.public_key:
            raise ValueError("Публічний ключ не завантажено")

        hasher = hashes.Hash(hashes.SHA256())
        while chunk := await stream.read(64 * 1024):
            hasher.update(chunk)
        digest = hasher.finalize()

        try:
            self.public_key.verify(
                signature,
                digest,
                utils.Prehashed(hashes.SHA256())
            )
            return True
        except InvalidSignature:
            return False
