import { useState } from "react";
import axios from "axios";
import { Card, Typography } from "antd";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import Dragger from "antd/es/upload/Dragger";
import { InboxOutlined } from "@ant-design/icons";

interface ILab2G {
  hash: string;
}

interface ILab2C {
  is_valid: boolean;
  hash: string;
}

export default function Lab2() {
  const [msg, setMsg] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [resultG, setResultG] = useState<ILab2G | null>(null);
  const [resultC, setResultC] = useState<ILab2C | null>(null);

  const handleSubmit = async () => {
    try {
      let response;
      const formData = new FormData();

      if (file) {
        formData.append("file", file);
        response = await axios.post<ILab2G>(
          "http://localhost:8000/api/lab2/generate/file",
          formData,
        );
      } else {
        formData.append("msg", msg);
        response = await axios.post<ILab2G>(
          "http://localhost:8000/api/lab2/generate/text",
          formData,
        );
      }

      setResultG(response.data);
    } catch (e) {
      alert("Помилка при генерації хеша");
    }
  };

  const handleFileSubmit = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    if (msg) formData.append("hash", msg);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/lab2/check",
        formData,
      );
      setResultC(response.data);
    } catch (e) {
      alert("Помилка при обробці файлу");
    }
  };

  const downloadTxt = () => {
    if (!resultG) return;

    const content = resultG.hash;

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "md5_result.txt");
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
      <Card>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Лабораторна №2 – MD5
        </Typography.Title>

        <Typography.Title level={4} style={{ marginTop: 0 }}>
          Теоретичні відомості
        </Typography.Title>

        <Typography.Paragraph>
          MD5 (Message Digest 5) — це криптографічна хеш-функція, яка перетворює
          довільне повідомлення у 128-бітний хеш. Алгоритм працює блоками по 512
          біт, використовує 4 раунди нелінійних перетворень та операції
          побітових зсувів. Результат подається у вигляді 32-символьного
          hex-рядка.
        </Typography.Paragraph>
      </Card>

      <Tabs
        onSelect={() => {
          setMsg("");
          setFile(null);
          setResultC(null);
          setResultG(null);
        }}
      >
        <TabList>
          <Tab>Хешувати</Tab>
          <Tab>Перевірка файлу</Tab>
        </TabList>
        <TabPanel>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Dragger
                beforeUpload={(file) => {
                  setFile(file);
                  setMsg("");
                  return false;
                }}
                maxCount={1}
                onRemove={() => setFile(null)}
                disabled={!!msg}
              >
                <InboxOutlined />
                <Typography.Paragraph>
                  Перетягніть файл для хешування
                </Typography.Paragraph>
              </Dragger>

              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={msg}
                  placeholder="Або введіть повідомлення"
                  onChange={(e) => setMsg(e.target.value)}
                  style={{ flex: 1 }}
                  disabled={!!file}
                />

                <button onClick={handleSubmit}>Генерувати</button>
              </div>
            </div>
          </Card>
          {resultG && (
            <Card>
              <Typography.Title level={4} style={{ marginTop: 0 }}>
                Результат:
              </Typography.Title>

              <Card
                style={{
                  textAlign: "center",
                  minHeight: 120,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  marginBottom: 24,
                }}
              >
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {resultG.hash}
                </Typography.Title>
                <Typography.Text type="secondary">MD5 хеш</Typography.Text>
              </Card>
              <div style={{ display: "flex" }}>
                <button
                  // onClick={downloadTxt}
                  style={{ flex: 1 }}
                >
                  Завантажити
                </button>
              </div>
            </Card>
          )}
        </TabPanel>
        <TabPanel>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Dragger
                beforeUpload={(file) => {
                  setFile(file);
                  return false;
                }}
                maxCount={1}
                onRemove={() => setFile(null)}
              >
                <InboxOutlined />
                <Typography.Paragraph>
                  Натисніть або перетягніть файл для аналізу
                </Typography.Paragraph>
              </Dragger>
              <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                <input
                  placeholder="Вставте очікуваний MD5 хеш для перевірки цілісності"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button onClick={handleFileSubmit} disabled={!file}>
                  Обробити файл
                </button>
              </div>
            </div>
          </Card>
          {resultC && (
            <Card>
              <Typography.Title level={4} style={{ marginTop: 0 }}>
                Результат:
              </Typography.Title>

              <Card
                style={{
                  textAlign: "center",
                  minHeight: 120,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  marginBottom: 24,
                }}
              >
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {resultC.hash}
                </Typography.Title>
                <Typography.Text type="secondary">
                  {resultC.is_valid ? "Valid" : "Not match"}
                </Typography.Text>
              </Card>
              <div style={{ display: "flex" }}>
                <button
                  // onClick={downloadTxt}
                  style={{ flex: 1 }}
                >
                  Завантажити
                </button>
              </div>
            </Card>
          )}
        </TabPanel>
      </Tabs>
    </div>
  );
}
