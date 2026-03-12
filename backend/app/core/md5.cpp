#include <bits/stdc++.h>
using namespace std;

// назва дає про себе знати
const uint8_t MD5_BLOCK_SIZE = 64;
const uint8_t MD5_LAST_BLOCK_SIZE = 56;

// 2^32 на синус i
const uint32_t K[] = {
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
};

// ротації
const uint8_t S[] = {
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
};

class MD5 {
public:
// ініціалізація початкових змінних
    MD5() {
        A0 = 0x67452301;
        B0 = 0xefcdab89;
        C0 = 0x98badcfe;
        D0 = 0x10325476;
        count = 0;
        buffer.clear();
    }

// буферизуємо доки не буде 64, а там опрацьовуємо
    void update(const uint8_t* data, size_t len) {
        size_t i = 0;
        while (len > 0) {
            // оптимально назбирати або доадти що лишилось
            size_t to_copy = min(len, MD5_BLOCK_SIZE - buffer.size());
            buffer.insert(buffer.end(), data + i, data + i + to_copy);
            count += to_copy;
            i += to_copy;
            len -= to_copy;

            if (buffer.size() == MD5_BLOCK_SIZE) {
                process_block(buffer.data());
                buffer.clear();
            }
        }
    }

// на кінець додаємо padding та розмір повідомлення, та фінально опрацьовуємо
    string finalize() {
        uint64_t bits_len = count * 8;

        // базовий педдінг 
        buffer.push_back(0x80);
        while ((buffer.size() % MD5_BLOCK_SIZE) != MD5_LAST_BLOCK_SIZE)
            buffer.push_back(0x00);

        // а тут уже додавання розміру m у le
        for (int i = 0; i < 8; ++i)
            buffer.push_back((bits_len >> (8*i)));

        while (buffer.size() >= MD5_BLOCK_SIZE) {
            process_block(buffer.data());
            buffer.erase(buffer.begin(), buffer.begin() + MD5_BLOCK_SIZE);
        }

        // зліплюємо фінальний хеш
        uint8_t digest[16];
        put_uint32_le(A0, digest);
        put_uint32_le(B0, digest + 4);
        put_uint32_le(C0, digest + 8);
        put_uint32_le(D0, digest + 12);

        // оформлюємо у MD5 формат
        ostringstream oss;
        oss << hex << setfill('0');
        for (int i = 0; i < 16; ++i)
            oss << setw(2) << static_cast<int>(digest[i]);
        return oss.str();
    }

private:
    uint32_t A0, B0, C0, D0;
    uint64_t count;
    vector<uint8_t> buffer;

// серце алгоритму, обробляємо блоки по 512 біт
    void process_block(const uint8_t* block) {
        uint32_t M[16];
        for (int i = 0; i < 16; i++) {
            M[i] = block[i*4] | (block[i*4+1]<<8) | (block[i*4+2]<<16) | (block[i*4+3]<<24);
        }

        uint32_t A = A0, B = B0, C = C0, D = D0;

        for (int i = 0; i < 64; ++i) {
            uint32_t F, g;
            if (i < 16) {
                F = (B & C) | (~B & D);
                g = i;
            } else if (i < 32) {
                F = (B & D) | (C & ~D);
                g = (5*i + 1) & 15;
            } else if (i < 48) {
                F = B ^ C ^ D;
                g = (3*i + 5) & 15;
            } else {
                F = C ^ (B | ~D);
                g = (7*i) & 15;
            }

            F = F + A + K[i] + M[g];
            F = (F << S[i]) | (F >> (32 - S[i]));
            F = F + B;

            A = D;
            D = C;
            C = B;
            B = F;
        }

        A0 += A; B0 += B; C0 += C; D0 += D;
    }

// перекладач з 4 байтів у окремі байти
    void put_uint32_le(uint32_t val, uint8_t* out) { 
        out[0] = val; 
        out[1] = (val >> 8);
        out[2] = (val >> 16);
        out[3] = (val >> 24);
    }
};

#include <pybind11/pybind11.h>
namespace py = pybind11;

PYBIND11_MODULE(md5, m) {
    m.doc() = "MD5 for lab2";
    py::class_<MD5>(m, "MD5")
        .def(py::init<>())
        .def("update", [](MD5 &self, py::bytes data) {
            std::string_view s = data;
            self.update(reinterpret_cast<const uint8_t*>(s.data()), s.size());
        })
        .def("finalize", &MD5::finalize);
}