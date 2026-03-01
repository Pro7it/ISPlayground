from fastapi import HTTPException
import random
import math

m = 2**29 - 1
a = 16**3
c = 6765
x0 = 23

def lab1(count: int, m = 2**29 -1, a = 16**3, c = 6765, x0 = 23):
    if count <= 0 or count > int(1e6):
        raise HTTPException(status_code=400, detail="Неможливо згенерувати")

    def next_random(x_prev):
        return ((a*x_prev + c)%(m))

    randoms = []
    x_cur = x0
    for _ in range(count):
        x_cur = next_random(x_cur)
        randoms.append(x_cur)

    x_cur = x0
    T = 0
    for i in range(int(1e6)):
        x_cur = next_random(x_cur)
        T += 1
        if x_cur == x0:
            break

    def gcd(a,b):
        if a < b: a,b = b,a
        if a%b > 0: return gcd(b,a%b)
        return b

    gcd_cnt = 0
    x_cur = x0
    N = len(randoms)

    for _ in range(N):
        x_cur = next_random(x_cur)
        a_val = x_cur
        x_cur = next_random(x_cur)
        b_val = x_cur

        if gcd(a_val, b_val) == 1:
            gcd_cnt += 1

    P = gcd_cnt / N if N != 0 else 0

    pi_est_my = None
    if P != 0:
        pi_est_my = math.sqrt(6 / P)
        # pi_error_my = abs(math.pi - pi_est)


    random.seed(x0)
    gcd_cnt = 0

    for _ in range(N):
        if gcd(random.randint(1,m), random.randint(1,m)) == 1: gcd_cnt += 1

    P = gcd_cnt / N if N != 0 else 0

    pi_est_sys = None
    if P != 0:
        pi_est_sys = math.sqrt(6 / P)
        # pi_error_sys = abs(math.pi - pi_est)
    

    return {
        "numbers": randoms,
        "period": T,
        "pi_est_my": pi_est_my,
        "pi_est_sys": pi_est_sys,
    }
