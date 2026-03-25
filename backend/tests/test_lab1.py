import pytest
from app.core.lab1 import LCG


def test_generate_returns_correct_len():
    lcg = LCG()
    nums = lcg.generate(5)
    assert len(nums) == 5


def test_generate_raises_for_zero():
    lcg = LCG()
    with pytest.raises(ValueError):
        lcg.generate(0)


def test_generate_raises_for_negative():
    lcg = LCG()
    with pytest.raises(ValueError):
        lcg.generate(-10)


def test_generate_raises_for_huge():
    lcg = LCG()
    with pytest.raises(ValueError):
        lcg.generate(int(1e6 + 1))


def test_generate_numbers_are_int():
    lcg = LCG()
    nums = lcg.generate(5)
    for num in nums:
        assert isinstance(num, int)


def test_period_is_positive():
    lcg = LCG(seed=23)
    period = lcg.period()
    assert period > 0


def test_estimate_pi_returns_number():
    lcg = LCG(seed=23)
    pi = lcg.estimate_pi(100)
    assert pi is None or isinstance(pi, float)


def test_generate_iv_length():
    lcg = LCG(seed=23)
    iv = lcg.generate_iv(8)
    assert isinstance(iv, bytes)
    assert len(iv) == 8


def test_iv_not_constant():
    lcg1 = LCG(seed=1)
    lcg2 = LCG(seed=2)
    iv1 = lcg1.generate_iv()
    iv2 = lcg2.generate_iv()
    assert iv1 != iv2