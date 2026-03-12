import pytest
from fastapi import HTTPException
from app.core.lab1 import lab1

def test_generate_returns_correct_len():
    res = lab1(5)

    assert "numbers" in res
    assert len(res["numbers"]) == 5

def test_generate_raises_exception_for_zero():
    with pytest.raises(HTTPException) as exc_info:
        lab1(0)

    assert exc_info.value.status_code == 400

def test_generate_raises_exception_for_negative():
    with pytest.raises(HTTPException) as exc_info:
        lab1(-13)

    assert exc_info.value.status_code == 400

def test_generate_raises_exception_for_huge_number():
    with pytest.raises(HTTPException) as exc_info:
        lab1(int(1e6+1))

    assert exc_info.value.status_code == 400

def test_generate_numbers_are_int():
    result = lab1(3)

    for num in result["numbers"]:
        assert isinstance(num, int)


def test_period_is_positive():
    result = lab1(3)

    assert result["period"] > 0