#include <bits/stdc++.h>
using namespace std;

#include <pybind11/pybind11.h>
namespace py = pybind11;

const uint8_t W = 32; // довжина слова
const uint8_t R = 20; // раунди
const uint8_t B = 32; // довжина ключа

const uint32_t P = 0xB7E15163; // константа P
const uint32_t Q = 0x9E3779B9; // константа Q

const uint8_t BLOCK_SIZE = 8; // розмір блоку, який передаємо у альгоритм

class RC5 {
public:

    // приймаємо ключ і зразу його шифруємо
    RC5(py::bytes key_bytes) {
        string key_str = key_bytes;
        vector<uint8_t> key(key_str.begin(), key_str.end());
        keyExpansion(key);
    }

    // CBC з попереднім A,B
    py::tuple encrypt(py::bytes data_bytes, uint32_t prevA, uint32_t prevB) {
        string data_str = data_bytes;
        vector<uint8_t> input(data_str.begin(), data_str.end());

        vector<uint8_t> out;
        out.reserve(input.size());

        for (size_t i = 0; i + BLOCK_SIZE <= input.size(); i += BLOCK_SIZE) {
            uint32_t A = bytesToUInt(&input[i]);
            uint32_t B = bytesToUInt(&input[i + 4]);
            A ^= prevA; B ^= prevB;
            encryptBlock(A, B);
            prevA = A; prevB = B;
            appendUInt(out, A);
            appendUInt(out, B);
        }

        return py::make_tuple(py::bytes((char*)out.data(), out.size()), prevA, prevB);
    }

    // розшифрування з попередніми
    py::tuple decrypt(py::bytes data_bytes, uint32_t prevA, uint32_t prevB, bool last_chunk) {
        string data_str = data_bytes;
        vector<uint8_t> data(data_str.begin(), data_str.end());

        vector<uint8_t> out;
        out.reserve(data.size());

        for (size_t i = 0; i + BLOCK_SIZE <= data.size(); i += BLOCK_SIZE) {
            uint32_t A = bytesToUInt(&data[i]);
            uint32_t B = bytesToUInt(&data[i + 4]);
            uint32_t tempA = A, tempB = B;
            decryptBlock(A, B);
            A ^= prevA; B ^= prevB;
            prevA = tempA; prevB = tempB;
            appendUInt(out, A);
            appendUInt(out, B);
        }

        if (last_chunk) out = unpad(out);

        return py::make_tuple(py::bytes((char*)out.data(), out.size()), prevA, prevB);
    }

    // шифрування без вектора
    py::bytes encrypt_ecb(py::bytes data_bytes) {
        string data_str = data_bytes;
        uint32_t A = bytesToUInt((uint8_t*)data_str.data());
        uint32_t B = bytesToUInt((uint8_t*)data_str.data() + 4);
        encryptBlock(A, B);
        vector<uint8_t> out;
        appendUInt(out, A);
        appendUInt(out, B);
        return py::bytes((char*)out.data(), out.size());
    }

    // дешифрування без вектора
    py::bytes decrypt_ecb(py::bytes data_bytes) {
        string data_str = data_bytes;
        uint32_t A = bytesToUInt((uint8_t*)data_str.data());
        uint32_t B = bytesToUInt((uint8_t*)data_str.data() + 4);
        decryptBlock(A, B);
        vector<uint8_t> out;
        appendUInt(out, A);
        appendUInt(out, B);
        return py::bytes((char*)out.data(), out.size());
    }

private:
    vector<uint32_t> S; // розширений ключ для перемішування

    void keyExpansion(const vector<uint8_t>& key) {
        int C = (B + 3) / 4;
        vector<uint32_t> L(C, 0); // ключ у 32-бітних словах

        for (int i = B - 1; i >= 0; i--)
            L[i / 4] = (L[i / 4] << 8) + key[i];

        S.resize(2 * (R + 1));
        S[0] = P;
        for (size_t i = 1; i < S.size(); i++) S[i] = S[i - 1] + Q; 

        int n = 3 * max(C, (int)S.size());
        uint32_t A = 0, Bv = 0;
        int i = 0, j = 0;

        for (int k = 0; k < n; k++) { // перемішуємо S та L
            A = S[i] = rotLeft(S[i] + A + Bv, 3);
            Bv = L[j] = rotLeft(L[j] + A + Bv, (A + Bv) & W);
            i = (i + 1) % S.size();
            j = (j + 1) % C;
        }
    }

    // приймаєм A та B і шифруємо їх
    void encryptBlock(uint32_t& A, uint32_t& B) {
        A += S[0]; B += S[1];
        for (int i = 1; i <= R; i++) {
            A = rotLeft(A ^ B, B) + S[2 * i];
            B = rotLeft(B ^ A, A) + S[2 * i + 1];
        }
    }
    // абсолютно зворотнє до блоку вище
    void decryptBlock(uint32_t& A, uint32_t& B) {
        for (int i = R; i >= 1; i--) {
            B = rotRight(B - S[2 * i + 1], A) ^ A;
            A = rotRight(A - S[2 * i], B) ^ B;
        }
        B -= S[1]; A -= S[0];
    }

    // зсув вліво
    static uint32_t rotLeft(uint32_t x, uint32_t y) {
        y &= W;
        return (x << y) | (x >> (W - y));
    }

    // зсув вправо
    static uint32_t rotRight(uint32_t x, uint32_t y) {
        y &= W;
        return (x >> y) | (x << (W - y));
    }

    // збираємо 32 бітне число з маленьких 8 біт
    static uint32_t bytesToUInt(const uint8_t* b) {
        return b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24);
    }

    // абсолютно навпаки, 32 біти розділяємо на масив по 8 біт
    static void appendUInt(vector<uint8_t>& out, uint32_t x) {
        out.insert(out.end(), (uint8_t*)&x, (uint8_t*)&x + 4);
    }

    // на кінці, щоб отримати чисті даніт
    vector<uint8_t> unpad(const vector<uint8_t>& data) {
        if (data.empty()) return data;
        size_t pad_len = data.back();
        if (pad_len > data.size()) return data; // Invalid padding
        return vector<uint8_t>(data.begin(), data.end() - pad_len);
    }
};

PYBIND11_MODULE(rc5, m) {
    py::class_<RC5>(m, "RC5")
        .def(py::init<py::bytes>())
        .def("encrypt", &RC5::encrypt)
        .def("decrypt", &RC5::decrypt)
        .def("encrypt_ecb", &RC5::encrypt_ecb)
        .def("decrypt_ecb", &RC5::decrypt_ecb);
}