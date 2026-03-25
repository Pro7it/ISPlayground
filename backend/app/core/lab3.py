from app.core import md5
from app.core.lab1 import LCG

class RC5:
    BLOCK_SIZE = 8
    W = 32
    R = 20
    B = 32
    P = 0xB7E15163
    Q = 0x9E3779B9

    def __init__(self, password: str):
        self.S = []
        self.key = self._derive_key(password)
        self._key_expansion(self.key)

    def _derive_key(self, pwd: str) -> bytes:
        m1 = md5.MD5()
        m1.update(pwd.encode())
        h1 = bytes.fromhex(m1.finalize())

        m2 = md5.MD5()
        m2.update(h1)
        h2 = bytes.fromhex(m2.finalize())

        return h2 + h1

    @staticmethod
    def _rot_left(x: int, y: int):
        y %= RC5.W
        return ((x << y) & 0xFFFFFFFF) | (x >> (RC5.W - y))

    @staticmethod
    def _rot_right(x: int, y: int):
        y %= RC5.W
        return (x >> y) | ((x << (RC5.W - y)) & 0xFFFFFFFF)

    def _key_expansion(self, key_bytes: bytes):
        C = (self.B * 8 + self.W - 1) // self.W
        L = [0] * C

        for i in reversed(range(len(key_bytes))):
            L[i // 4] = (L[i // 4] << 8) + key_bytes[i]

        self.S = [0] * (2 * (self.R + 1))
        self.S[0] = self.P

        for i in range(1, len(self.S)):
            self.S[i] = (self.S[i - 1] + self.Q) & 0xFFFFFFFF

        A = Bv = i = j = 0
        n = 3 * max(C, len(self.S))

        for _ in range(n):
            A = self.S[i] = self._rot_left((self.S[i] + A + Bv) & 0xFFFFFFFF, 3)
            Bv = L[j] = self._rot_left((L[j] + A + Bv) & 0xFFFFFFFF, (A + Bv) & 0x1F)
            i = (i + 1) % len(self.S)
            j = (j + 1) % C

    def _encrypt_block(self, block: bytes):
        A = int.from_bytes(block[:4], "little")
        B = int.from_bytes(block[4:], "little")

        A = (A + self.S[0]) & 0xFFFFFFFF
        B = (B + self.S[1]) & 0xFFFFFFFF

        for i in range(1, self.R + 1):
            A = (self._rot_left(A ^ B, B) + self.S[2 * i]) & 0xFFFFFFFF
            B = (self._rot_left(B ^ A, A) + self.S[2 * i + 1]) & 0xFFFFFFFF

        return A.to_bytes(4, "little") + B.to_bytes(4, "little")

    def _decrypt_block(self, block: bytes):
        A = int.from_bytes(block[:4], "little")
        B = int.from_bytes(block[4:], "little")

        for i in range(self.R, 0, -1):
            B = self._rot_right((B - self.S[2 * i + 1]) & 0xFFFFFFFF, A) ^ A
            A = self._rot_right((A - self.S[2 * i]) & 0xFFFFFFFF, B) ^ B

        B = (B - self.S[1]) & 0xFFFFFFFF
        A = (A - self.S[0]) & 0xFFFFFFFF

        return A.to_bytes(4, "little") + B.to_bytes(4, "little")

    def _pad(self, data: bytes):
        pad_len = self.BLOCK_SIZE - (len(data) % self.BLOCK_SIZE)
        return data + bytes([pad_len] * pad_len)

    def _unpad(self, data: bytes):
        return data[:-data[-1]]

    def _encrypt_cbc(self, data: bytes, iv: bytes):
        data = self._pad(data)
        result = b""
        prev = iv

        for i in range(0, len(data), self.BLOCK_SIZE):
            block = data[i:i+8]
            xored = bytes(a ^ b for a, b in zip(block, prev))
            cipher = self._encrypt_block(xored)

            result += cipher
            prev = cipher

        return result

    def _decrypt_cbc(self, data: bytes, iv: bytes):
        result = b""
        prev = iv

        for i in range(0, len(data), self.BLOCK_SIZE):
            block = data[i:i+8]
            dec = self._decrypt_block(block)

            plain = bytes(a ^ b for a, b in zip(dec, prev))
            result += plain
            prev = block

        return self._unpad(result)

    def encrypt(self, data: bytes):
        lcg = LCG()
        iv = lcg.generate_iv()

        encrypted_iv = self._encrypt_block(iv)
        cipher = self._encrypt_cbc(data, iv)

        return encrypted_iv + cipher

    def decrypt(self, data: bytes):
        enc_iv = data[:8]
        cipher = data[8:]

        iv = self._decrypt_block(enc_iv)
        return self._decrypt_cbc(cipher, iv)