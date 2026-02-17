import os
import random
import math

m = 2**18 - 1
a = 5**3
c = 34
x0 = 512

def generate(count):

    def next_random(x_prev):
        return ((a*x_prev + c)%(m))

    randoms = []
    x_cur = x0
    for _ in range(count):
        x_cur = next_random(x_cur)
        randoms.append(x_cur)

    x_cur = x0
    T = 0
    while True:
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

    pi_error_my = None
    if P != 0:
        pi_est = math.sqrt(6 / P)
        pi_error_my = abs(math.pi - pi_est)


    random.seed(x0)
    gcd_cnt = 0

    for _ in range(N):
        if gcd(random.randint(1,m), random.randint(1,m)) == 1: gcd_cnt += 1

    P = gcd_cnt / N if N != 0 else 0

    pi_error_sys = None
    if P != 0:
        pi_est = math.sqrt(6 / P)
        pi_error_sys = abs(math.pi - pi_est)
    

    return {
        "numbers": randoms,
        "period": T,
        "pi_error_my": pi_error_my,
        "pi_error_sys": pi_error_sys,
    }
