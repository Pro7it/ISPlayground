import { useState } from "react";
import axios from "axios";
import { Card, Spin, Typography } from "antd";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import Dragger from "antd/es/upload/Dragger";
import {
  KeyOutlined,
  FileOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

export default function Lab5() {
  const [file, setFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [textToSign, setTextToSign] = useState("");
  const [signature, setSignature] = useState("");
  const [textToVerify, setTextToVerify] = useState("");
  const [signatureToVerify, setSignatureToVerify] = useState("");
  const [verificationResult, setVerificationResult] = useState<boolean | null>(
    null,
  );

  const readKeyFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleGenerateKeys = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8000/api/lab5/generate-keys",
      );
      setPrivateKey(res.data.private_key);
      setPublicKey(res.data.public_key);
    } catch {
      alert("Помилка генерації ключів");
    } finally {
      setLoading(false);
    }
  };

  const downloadKey = async (content: string, suggestedName: string) => {
    try {
      const blob = new Blob([content], { type: "text/plain" });
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: suggestedName,
        types: [
          {
            description: "PEM Key File",
            accept: { "text/plain": [".pem"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (e) {
      console.log("Збереження скасовано");
    }
  };

  const handleSignText = async () => {
    if (!textToSign || !keyFile) {
      alert("Введіть текст і оберіть файл приватного ключа");
      return;
    }
    try {
      setLoading(true);
      const privateKeyContent = await readKeyFile(keyFile);
      const formData = new FormData();
      formData.append("text", textToSign);
      formData.append("private_key", privateKeyContent);

      const res = await axios.post(
        "http://localhost:8000/api/lab5/sign/text",
        formData,
      );
      setSignature(res.data.signature);
    } catch (e: any) {
      alert(`Помилка підпису: ${e.response?.data?.detail || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignFile = async () => {
    if (!file || !keyFile) {
      alert("Оберіть файл і файл приватного ключа");
      return;
    }
    try {
      setLoading(true);
      const privateKeyContent = await readKeyFile(keyFile);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("private_key", privateKeyContent);

      const res = await axios.post(
        "http://localhost:8000/api/lab5/sign/file",
        formData,
      );
      setSignature(res.data.signature);
    } catch (e: any) {
      alert(`Помилка підпису: ${e.response?.data?.detail || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyText = async () => {
    if (!textToVerify || !signatureToVerify || !keyFile) {
      alert("Введіть текст, підпис і оберіть файл публічного ключа");
      return;
    }
    try {
      setLoading(true);
      const publicKeyContent = await readKeyFile(keyFile);
      const formData = new FormData();
      formData.append("text", textToVerify);
      formData.append("signature", signatureToVerify);
      formData.append("public_key", publicKeyContent);

      const res = await axios.post(
        "http://localhost:8000/api/lab5/verify/text",
        formData,
      );
      setVerificationResult(res.data.is_valid);
    } catch (e: any) {
      alert(`Помилка верифікації: ${e.response?.data?.detail || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyFile = async () => {
    if (!file || !signatureToVerify || !keyFile) {
      alert("Оберіть файл, введіть підпис і оберіть файл публічного ключа");
      return;
    }
    try {
      setLoading(true);
      const publicKeyContent = await readKeyFile(keyFile);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signatureToVerify);
      formData.append("public_key", publicKeyContent);

      const res = await axios.post(
        "http://localhost:8000/api/lab5/verify/file",
        formData,
      );
      setVerificationResult(res.data.is_valid);
    } catch (e: any) {
      alert(`Помилка верифікації: ${e.response?.data?.detail || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadSignature = async () => {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: "signature.txt",
      });
      const writable = await handle.createWritable();
      await writable.write(signature);
      await writable.close();
    } catch (e) {
      console.log("Збереження скасовано");
    }
  };

  return (
    <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
      <Card>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Лабораторна №5 – Цифровий підпис (DSA)
        </Typography.Title>
        <Typography.Paragraph>
          Цифровий підпис забезпечує цілісність та автентичність даних.
        </Typography.Paragraph>
      </Card>

      <Tabs
        onSelect={() => {
          setFile(null);
          setKeyFile(null);
          setSignature("");
          setVerificationResult(null);
        }}
      >
        <TabList>
          <Tab>Ключі</Tab>
          <Tab>Підписати</Tab>
          <Tab>Перевірити</Tab>
        </TabList>

        <TabPanel>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <textarea
                  placeholder="Публічний ключ"
                  value={publicKey}
                  readOnly
                  style={{ flex: 1, height: 150 }}
                />
                <textarea
                  placeholder="Приватний ключ"
                  value={privateKey}
                  readOnly
                  style={{ flex: 1, height: 150 }}
                />
              </div>
              <div style={{ display: "flex" }}>
                <button
                  onClick={handleGenerateKeys}
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  Згенерувати пару ключів DSA
                </button>
              </div>
              {publicKey && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => downloadKey(publicKey, "dsa_public.pem")}
                    style={{ flex: 1 }}
                  >
                    Завантажити Public Key (.pem)
                  </button>
                  <button
                    onClick={() => downloadKey(privateKey, "dsa_private.pem")}
                    style={{ flex: 1 }}
                  >
                    Завантажити Private Key (.pem)
                  </button>
                </div>
              )}
            </div>
          </Card>
        </TabPanel>

        <TabPanel>
          <Card title="Створення підпису">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Typography.Text>
                1. Оберіть файл приватного ключа:
              </Typography.Text>
              <Dragger
                beforeUpload={(f) => {
                  setKeyFile(f);
                  return false;
                }}
                maxCount={1}
                onRemove={() => setKeyFile(null)}
              >
                <KeyOutlined style={{ fontSize: 24 }} />
                <p>{keyFile ? keyFile.name : "Завантажте dsa_private.pem"}</p>
              </Dragger>

              <Tabs>
                <TabList>
                  <Tab>Текст</Tab>
                  <Tab>Файл</Tab>
                </TabList>
                <TabPanel>
                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex" }}>
                      <input
                        type="text"
                        placeholder="Введіть текст для підпису"
                        value={textToSign}
                        onChange={(e) => setTextToSign(e.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>
                    <div style={{ display: "flex" }}>
                      <button
                        onClick={handleSignText}
                        disabled={loading}
                        style={{ flex: 1 }}
                      >
                        Підписати текст
                      </button>
                    </div>
                  </div>
                </TabPanel>
                <TabPanel>
                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <Dragger
                      beforeUpload={(f) => {
                        setFile(f);
                        return false;
                      }}
                      maxCount={1}
                      onRemove={() => setFile(null)}
                    >
                      <FileOutlined style={{ fontSize: 24 }} />
                      <p>{file ? file.name : "Оберіть файл для підпису"}</p>
                    </Dragger>
                    <div style={{ display: "flex" }}>
                      <button
                        onClick={handleSignFile}
                        disabled={loading}
                        style={{ flex: 1 }}
                      >
                        Підписати файл
                      </button>
                    </div>
                  </div>
                </TabPanel>
              </Tabs>

              {signature && (
                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <Typography.Text>Результат підпису (HEX):</Typography.Text>
                  <div style={{ display: "flex" }}>
                    <input value={signature} readOnly style={{ flex: 1 }} />
                  </div>
                  <div style={{ display: "flex" }}>
                    <button onClick={downloadSignature} style={{ flex: 1 }}>
                      Зберегти підпис у файл
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabPanel>

        <TabPanel>
          <Card title="Перевірка підпису">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Typography.Text>
                1. Оберіть файл публічного ключа:
              </Typography.Text>
              <Dragger
                beforeUpload={(f) => {
                  setKeyFile(f);
                  return false;
                }}
                maxCount={1}
                onRemove={() => setKeyFile(null)}
              >
                <KeyOutlined style={{ fontSize: 24 }} />
                <p>{keyFile ? keyFile.name : "Завантажте dsa_public.pem"}</p>
              </Dragger>

              <Typography.Text>2. Введіть підпис (HEX):</Typography.Text>
              <div style={{ display: "flex" }}>
                <input
                  placeholder="Вставте HEX-підпис тут"
                  value={signatureToVerify}
                  onChange={(e) => setSignatureToVerify(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>

              <Tabs>
                <TabList>
                  <Tab>Текст</Tab>
                  <Tab>Файл</Tab>
                </TabList>
                <TabPanel>
                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex" }}>
                      <input
                        type="text"
                        placeholder="Введіть оригінальний текст"
                        value={textToVerify}
                        onChange={(e) => setTextToVerify(e.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>
                    <div style={{ display: "flex" }}>
                      <button
                        onClick={handleVerifyText}
                        disabled={loading}
                        style={{ flex: 1 }}
                      >
                        Перевірити підпис тексту
                      </button>
                    </div>
                  </div>
                </TabPanel>
                <TabPanel>
                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <Dragger
                      beforeUpload={(f) => {
                        setFile(f);
                        return false;
                      }}
                      maxCount={1}
                      onRemove={() => setFile(null)}
                    >
                      <FileOutlined style={{ fontSize: 24 }} />
                      <p>{file ? file.name : "Оберіть файл для перевірки"}</p>
                    </Dragger>
                    <div style={{ display: "flex" }}>
                      <button
                        onClick={handleVerifyFile}
                        disabled={loading}
                        style={{ flex: 1 }}
                      >
                        Перевірити підпис файлу
                      </button>
                    </div>
                  </div>
                </TabPanel>
              </Tabs>

              {verificationResult !== null && (
                <div style={{ marginTop: 12, textAlign: "center" }}>
                  {verificationResult ? (
                    <Typography.Text type="success" style={{ fontSize: 18 }}>
                      Підпис валідний
                    </Typography.Text>
                  ) : (
                    <Typography.Text type="danger" style={{ fontSize: 18 }}>
                      Підпис не валідний
                    </Typography.Text>
                  )}
                </div>
              )}
            </div>
          </Card>
        </TabPanel>
      </Tabs>
      {loading && (
        <Card>
          <div
            style={{ display: "flex", justifyContent: "center", padding: 20 }}
          >
            <Spin size="large" />
          </div>
        </Card>
      )}
    </div>
  );
}
