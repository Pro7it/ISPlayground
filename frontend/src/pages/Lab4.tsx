import { useState } from "react";
import axios from "axios";
import { Card, Spin, Typography } from "antd";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import Dragger from "antd/es/upload/Dragger";
import { InboxOutlined, KeyOutlined, FileOutlined } from "@ant-design/icons";

export default function Lab4() {
  const [file, setFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [loading, setLoading] = useState(false);

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
      const res = await axios.post(
        "http://localhost:8000/api/lab4/generate-keys",
      );
      setPrivateKey(res.data.private_key);
      setPublicKey(res.data.public_key);
    } catch {
      alert("Помилка генерації ключів");
    }
  };

  // Оновлена функція скачування ключів з вибором місця та назви
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

  const handleEncrypt = async () => {
    if (!file || !keyFile) {
      alert("Файл і файл ключа обовʼязкові");
      return;
    }

    let writable: any = null;
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: `${file.name}.enc`,
      });

      setLoading(true);
      const keyContent = await readKeyFile(keyFile);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("public_key", keyContent);

      const response = await fetch("http://localhost:8000/api/lab4/encrypt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
      if (!response.body) throw new Error("No response body");

      writable = await handle.createWritable();

      await response.body.pipeTo(writable);
      writable = null;

      alert("Шифрування завершено!");
    } catch (e: any) {
      console.error("Encryption error details:", e);
      if (e.name !== "AbortError") {
        alert(`Помилка шифрування: ${e.message}`);
      }
    } finally {
      setLoading(false);
      if (writable) await writable.close().catch(() => {});
    }
  };

  const handleDecrypt = async () => {
    if (!file || !keyFile) {
      alert("Файл і файл ключа обовʼязкові");
      return;
    }

    let writable: any = null;
    try {
      const filename = file.name.endsWith(".enc")
        ? file.name.slice(0, -4)
        : `decrypted_${file.name}`;

      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
      });

      setLoading(true);
      const keyContent = await readKeyFile(keyFile);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("private_key", keyContent);

      const response = await fetch("http://localhost:8000/api/lab4/decrypt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
      if (!response.body) throw new Error("No response body");

      writable = await handle.createWritable();

      await response.body.pipeTo(writable);
      writable = null;

      alert("Дешифрування завершено!");
    } catch (e: any) {
      console.error("Decryption error details:", e);
      if (e.name !== "AbortError") {
        alert(`Помилка дешифрування: ${e.message}`);
      }
    } finally {
      setLoading(false);
      if (writable) await writable.close().catch(() => {});
    }
  };

  return (
    <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
      <Card>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Лабораторна №4 – RSA
        </Typography.Title>
        <Typography.Paragraph>
          RSA — асиметричний криптографічний алгоритм.
        </Typography.Paragraph>
      </Card>

      <Tabs
        onSelect={() => {
          setFile(null);
          setKeyFile(null);
        }}
      >
        <TabList>
          <Tab>Ключі</Tab>
          <Tab>Шифрувати</Tab>
          <Tab>Дешифрувати</Tab>
        </TabList>

        <TabPanel>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <textarea
                  placeholder="Публічний ключ"
                  value={publicKey}
                  readOnly
                  style={{ width: "50%", height: 150 }}
                />
                <textarea
                  placeholder="Приватний ключ"
                  value={privateKey}
                  readOnly
                  style={{ width: "50%", height: 150 }}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleGenerateKeys} style={{ flex: 1 }}>
                  Згенерувати ключі
                </button>
              </div>
              {publicKey && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => downloadKey(publicKey, "public_key.pem")}
                    style={{ flex: 1 }}
                  >
                    Завантажити Public Key (.pem)
                  </button>
                  <button
                    onClick={() => downloadKey(privateKey, "private_key.pem")}
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
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Typography.Text>
                1. Оберіть файл ключа (Public Key):
              </Typography.Text>
              <Dragger
                beforeUpload={(f) => {
                  setKeyFile(f);
                  return false;
                }}
                maxCount={1}
                onRemove={() => setKeyFile(null)}
              >
                <KeyOutlined />
                <Typography.Paragraph>
                  {keyFile ? keyFile.name : "Завантаж файл ключа (.pem)"}
                </Typography.Paragraph>
              </Dragger>

              <Typography.Text>2. Оберіть файл для шифрування:</Typography.Text>
              <Dragger
                beforeUpload={(f) => {
                  setFile(f);
                  return false;
                }}
                maxCount={1}
                onRemove={() => setFile(null)}
              >
                <FileOutlined />
                <Typography.Paragraph>
                  {file ? file.name : "Завантаж файл для обробки"}
                </Typography.Paragraph>
              </Dragger>

              <button
                onClick={handleEncrypt}
                disabled={loading || !file || !keyFile}
              >
                Шифрувати
              </button>
            </div>
          </Card>
        </TabPanel>

        <TabPanel>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Typography.Text>
                1. Оберіть файл ключа (Private Key):
              </Typography.Text>
              <Dragger
                beforeUpload={(f) => {
                  setKeyFile(f);
                  return false;
                }}
                maxCount={1}
                onRemove={() => setKeyFile(null)}
              >
                <KeyOutlined />
                <Typography.Paragraph>
                  {keyFile ? keyFile.name : "Завантаж файл ключа (.pem)"}
                </Typography.Paragraph>
              </Dragger>

              <Typography.Text>
                2. Оберіть файл для дешифрування:
              </Typography.Text>
              <Dragger
                beforeUpload={(f) => {
                  setFile(f);
                  return false;
                }}
                maxCount={1}
                onRemove={() => setFile(null)}
              >
                <FileOutlined />
                <Typography.Paragraph>
                  {file ? file.name : "Завантаж файл для обробки"}
                </Typography.Paragraph>
              </Dragger>

              <button
                onClick={handleDecrypt}
                disabled={loading || !file || !keyFile}
              >
                Дешифрувати
              </button>
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
