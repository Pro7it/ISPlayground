import math
import random

class LCG:
    def __init__(self, seed: int = 23, m: int = 2**29 - 1, a: int = 16**3, c: int = 6765):
        self.m = m
        self.a = a
        self.c = c
        self.x = seed

    def next(self) -> int:
        self.x = (self.a * self.x + self.c) % self.m
        return self.x

    def generate(self, count: int):
        if count <= 0 or count > int(1e6):
            raise ValueError("Неможливо згенерувати")

        return [self.next() for _ in range(count)]

    def period(self, limit: int = int(1e6)) -> int:
        start = self.x
        x_cur = start

        for i in range(1, limit + 1):
            x_cur = (self.a * x_cur + self.c) % self.m
            if x_cur == start:
                return i
        return limit

    @staticmethod
    def gcd(a, b):
        while b:
            a, b = b, a % b
        return a

    def estimate_pi(self, count: int):
        if count <= 0:
            return None

        gcd_cnt = 0

        for _ in range(count):
            a_val = self.next()
            b_val = self.next()

            if self.gcd(a_val, b_val) == 1:
                gcd_cnt += 1

        P = gcd_cnt / count
        return math.sqrt(6 / P) if P != 0 else None

    def estimate_pi_system(self, count: int):
        random.seed(self.x)

        gcd_cnt = 0
        for _ in range(count):
            if self.gcd(random.randint(1, self.m), random.randint(1, self.m)) == 1:
                gcd_cnt += 1

        P = gcd_cnt / count
        return math.sqrt(6 / P) if P != 0 else None

    def generate_iv(self, block_size: int = 8):
        iv = b""

        while len(iv) < block_size:
            num = self.next()
            iv += num.to_bytes(4, "little")

        return iv[:block_size]