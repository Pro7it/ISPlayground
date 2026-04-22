from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes


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

    async def encrypt_stream(self, file):
        if not self.public_key:
            raise ValueError("Public key not loaded")

        chunk_size = 190

        while True:
            chunk = await file.read(chunk_size)
            if not chunk:
                break

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

    async def decrypt_stream(self, file):
        if not self.private_key:
            raise ValueError("Private key not loaded")

        while True:
            length_bytes = await file.read(4)
            if not length_bytes:
                break

            length = int.from_bytes(length_bytes, 'big')
            encrypted_chunk = await file.read(length)

            decrypted = self.private_key.decrypt(
                encrypted_chunk,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )

            yield decrypted