#include <bits/stdc++.h>
using namespace std;

#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
namespace py = pybind11;

const uint8_t W = 32; // довжина слова
const uint8_t R = 20; // раунди
const uint8_t B = 32; // довжина ключа

const uint32_t P = 0xB7E15163; // константа P
const uint32_t Q = 0x9E3779B9; // константа Q

const uint8_t BLOCK_SIZE = 8; // розмір блоку, який передаємо у альгоритм

class RC5 {
public:
    RC5(const vector<uint8_t>& key) {
        keyExpansion(key);
    }

    // приймаємо файл та вектор ініціалізацій
    vector<uint8_t> encrypt(const vector<uint8_t>& data, const vector<uint8_t>& iv) {
        vector<uint8_t> padded = pad(data);
        vector<uint8_t> out;
        out.reserve(padded.size());

        // інт у байт
        uint32_t prevA = bytesToUInt(iv.data());
        uint32_t prevB = bytesToUInt(iv.data()+(BLOCK_SIZE/2));

        for (size_t i=0; i<padded.size(); i+=BLOCK_SIZE) {
            uint32_t A = bytesToUInt(&padded[i]);
            uint32_t B = bytesToUInt(&padded[i+(BLOCK_SIZE/2)]);

            A ^= prevA; B ^= prevB;
            encryptBlock(A, B);

            prevA = A; prevB = B;

            // байт у інт
            appendUInt(out, A);
            appendUInt(out, B);
        }

        return out;
    }

    // абсолютно те саме, окрім unpad вкінці
    vector<uint8_t> decrypt(const vector<uint8_t>& data, const vector<uint8_t>& iv) {
        vector<uint8_t> out;
        out.reserve(data.size());

        uint32_t prevA = bytesToUInt(iv.data());
        uint32_t prevB = bytesToUInt(iv.data()+(BLOCK_SIZE/2));

        for (size_t i=0; i<data.size(); i+=BLOCK_SIZE) {
            uint32_t A = bytesToUInt(&data[i]);
            uint32_t B = bytesToUInt(&data[i+(BLOCK_SIZE/2)]);

            uint32_t tempA = A, tempB = B;
            decryptBlock(A, B);

            A ^= prevA; B ^= prevB;

            prevA = tempA; prevB = tempB;

            appendUInt(out, A);
            appendUInt(out, B);
        }

        return unpad(out);
    }

private:
    vector<uint32_t> S; // ключ розбитий на етапи раундів

    // розбиття ключа
    void keyExpansion(const vector<uint8_t>& key) {

        int C = (key.size() + 3)/4;
        vector<uint32_t> L(C, 0);
        for (int i=key.size()-1; i>=0; i--) {
            L[i/4] = (L[i/4]<<8) + key[i];
        }

        S.resize(2*(R+1));
        S[0] = P;
        for (int i=1;i<S.size();i++) S[i] = S[i-1] + Q;

        int n = 3*max(C,(int)S.size());
        uint32_t A=0,B=0;
        int i=0,j=0;
        for(int k=0;k<n;k++){
            A = S[i] = rotLeft(S[i]+A+B,3);
            B = L[j] = rotLeft(L[j]+A+B,(A+B)&31);
            i = (i+1)%S.size();
            j = (j+1)%C;
        }
    }

    void encryptBlock(uint32_t& A, uint32_t& B) {
        A += S[0]; B += S[1];
        for(int i=1;i<=R;i++){
            A = rotLeft(A ^ B, B) + S[2*i];
            B = rotLeft(B ^ A, A) + S[2*i+1];
        }
    }

    void decryptBlock(uint32_t& A, uint32_t& B) {
        for(int i=R;i>=1;i--){
            B = rotRight(B - S[2*i+1], A) ^ A;
            A = rotRight(A - S[2*i], B) ^ B;
        }
        B -= S[1]; A -= S[0];
    }

    static uint32_t rotLeft(uint32_t x, uint32_t y) {
        y %= W;
        return (x << y) | (x >> (W - y));
    }

    static uint32_t rotRight(uint32_t x, uint32_t y) {
        y %= W;
        return (x >> y) | (x << (W - y));
    }

    vector<uint8_t> pad(const vector<uint8_t>& data){
        size_t pad_len = BLOCK_SIZE - (data.size()%BLOCK_SIZE);
        vector<uint8_t> res = data;
        res.insert(res.end(), pad_len, pad_len);
        return res;
    }

    vector<uint8_t> unpad(const vector<uint8_t>& data){
        if(data.empty()) return {};
        size_t pad_len = data.back();
        return vector<uint8_t>(data.begin(), data.end()-pad_len);
    }

    // байти в інт
    static uint32_t bytesToUInt(const uint8_t* b){
        return b[0] | (b[1]<<8) | (b[2]<<16) | (b[3]<<24);
    }

    // інт в байти
    static void appendUInt(vector<uint8_t>& out, uint32_t x){
        out.push_back(x);
        out.push_back((x>>8));
        out.push_back((x>>16));
        out.push_back((x>>24));
    }
};


PYBIND11_MODULE(rc5, m) {
    py::class_<RC5>(m, "RC5")
        .def(py::init<const std::vector<uint8_t>&>())
        .def("encrypt", &RC5::encrypt)
        .def("decrypt", &RC5::decrypt);
}