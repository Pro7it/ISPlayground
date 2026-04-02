import { useState } from "react";
import axios from "axios";
import { Card, Spin, Typography } from "antd";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import Dragger from "antd/es/upload/Dragger";
import { InboxOutlined } from "@ant-design/icons";

export default function Lab3() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleEncrypt = async () => {
    if (!file || !password) {
      alert("Будь ласка, виберіть файл та введіть пароль");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);

      const response = await axios.post(
        "http://localhost:8000/api/lab3/encrypt",
        formData,
        { responseType: "blob" },
      );

      const blob = response.data;

      const handle = await (window as any).showSaveFilePicker({
        suggestedName: `${file.name}.enc`,
      });

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (e: any) {
      alert(e.response?.data?.detail || "Помилка при шифруванні файлу");
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!file || !password) {
      alert("Будь ласка, виберіть файл та введіть пароль");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);

      const response = await axios.post(
        "http://localhost:8000/api/lab3/decrypt",
        formData,
        { responseType: "blob" },
      );

      const filename = file.name.endsWith(".enc")
        ? file.name.slice(0, -4)
        : `decrypted_${file.name}`;

      const blob = response.data;

      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
      });

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (e: any) {
      alert(e.response?.data?.detail || "Помилка при дешифруванні файлу");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
      <Card>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Лабораторна №3 – RC5
        </Typography.Title>

        <Typography.Title level={4} style={{ marginTop: 0 }}>
          Теоретичні відомості
        </Typography.Title>

        <Typography.Paragraph>
          RC5 — це симетричний блочний шифр, який шифрує дані блоками,
          використовує змінну кількість раундів та ключів, а також побітові
          операції XOR, додавання та циклічні зсуви.
        </Typography.Paragraph>
      </Card>

      <Tabs
        onSelect={() => {
          setFile(null);
          setPassword("");
        }}
      >
        <TabList>
          <Tab>Шифрувати</Tab>
          <Tab>Дешифрувати</Tab>
        </TabList>

        <TabPanel>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Dragger
                beforeUpload={(f) => {
                  setFile(f);
                  return false;
                }}
                maxCount={1}
                onRemove={() => setFile(null)}
                disabled={loading}
              >
                <InboxOutlined />
                <Typography.Paragraph>
                  Натисніть або перетягніть файл для шифрування
                </Typography.Paragraph>
              </Dragger>

              <div style={{ display: "flex" }}>
                <input
                  type="text"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ flex: 1 }}
                  disabled={loading}
                />
              </div>

              <button
                onClick={handleEncrypt}
                style={{ width: "100%" }}
                disabled={loading}
              >
                Шифрувати
              </button>
            </div>
          </Card>
        </TabPanel>

        <TabPanel>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Dragger
                beforeUpload={(f) => {
                  setFile(f);
                  return false;
                }}
                maxCount={1}
                onRemove={() => setFile(null)}
                disabled={loading}
              >
                <InboxOutlined />
                <Typography.Paragraph>
                  Натисніть або перетягніть файл для дешифрування
                </Typography.Paragraph>
              </Dragger>

              <div style={{ display: "flex" }}>
                <input
                  type="text"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: "100%" }}
                  disabled={loading}
                />
              </div>

              <button
                onClick={handleDecrypt}
                style={{ width: "100%" }}
                disabled={loading}
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
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <Spin size="large" />
          </div>
        </Card>
      )}
    </div>
  );
}
