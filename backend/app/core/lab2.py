from fastapi import HTTPException
import struct

K = [0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391]

S = [7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
    5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
    4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
    6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21]

class MD5:
    def __init__(self):
        self.A0 = 0x67452301
        self.B0 = 0xefcdab89
        self.C0 = 0x98badcfe
        self.D0 = 0x10325476
        self.count = 0
        self.buffer = b""

    def _combine(self, A,B,C,D,i,M):
        if i < 16:
            F = (B & C) | ((~B) & D)
            g = i
        elif i < 32:
            F = (B & D) | (C & (~D))
            g = (5*i + 1) % 16
        elif i < 48:
            F = B ^ C ^ D
            g = (3*i + 5) % 16
        else:
            F = C ^ (B | (~D))
            g = (7*i) % 16

        F = (F + A + K[i] + M[g]) & 0xFFFFFFFF
        F = ((F << S[i]) | (F >> (32 - S[i]))) & 0xFFFFFFFF
        F = (F + B) & 0xFFFFFFFF
        return F
    
    def _process_block(self,block):
        M = [int.from_bytes(block[j:j+4], byteorder='little') for j in range(0,64,4)]
        A,B,C,D = self.A0,self.B0,self.C0,self.D0

        for j in range(64):
            F = self._combine(A,B,C,D,j,M)
            A,B,C,D = D,F,B,C

        self.A0 = (self.A0 + A) & 0xFFFFFFFF
        self.B0 = (self.B0 + B) & 0xFFFFFFFF
        self.C0 = (self.C0 + C) & 0xFFFFFFFF
        self.D0 = (self.D0 + D) & 0xFFFFFFFF

    def update(self, chunk: bytes):
        self.buffer += chunk
        self.count += len(chunk)
        while len(self.buffer) >= 64:
            self._process_block(self.buffer[:64])
            self.buffer = self.buffer[64:]

    def finalize(self):
        orig_len_bits = self.count * 8

        padding = b'\x80'
        padding += b'\x00' * ((56 - (self.count + 1) % 64) % 64)
        padding += orig_len_bits.to_bytes(8, byteorder='little')

        self.update(padding)

        res = (
            self.A0.to_bytes(4, 'little') +
            self.B0.to_bytes(4, 'little') +
            self.C0.to_bytes(4, 'little') +
            self.D0.to_bytes(4, 'little')
        )

        return res.hex()

def lab2(msg: str):
    m = MD5()
    m.update(msg.encode('utf-8'))
    return {"hash": m.finalize()}