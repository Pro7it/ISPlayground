import { useState } from "react";
import axios from "axios";
import { Card, Spin, Typography } from "antd";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import Dragger from "antd/es/upload/Dragger";
import { InboxOutlined } from "@ant-design/icons";

interface ILab2 {
  is_valid: boolean;
  hash: string;
}

export default function Lab2() {
  const [msg, setMsg] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ILab2 | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let response;
      const formData = new FormData();

      if (file) {
        formData.append("file", file);
        response = await axios.post<ILab2>(
          "http://localhost:8000/api/lab2/generate/file",
          formData,
        );
      } else {
        formData.append("msg", msg);
        response = await axios.post<ILab2>(
          "http://localhost:8000/api/lab2/generate/text",
          formData,
        );
      }

      setResult(response.data);
    } catch (e: any) {
      alert(e.response?.data?.detail || "Помилка при генерації хеша");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSubmit = async () => {
    setLoading(true);
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    if (msg) formData.append("hash", msg);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/lab2/check",
        formData,
      );
      setResult(response.data);
    } catch (e: any) {
      alert(e.response?.data?.detail || "Помилка при обробці файлу");
    } finally {
      setLoading(false);
    }
  };

  const downloadTxt = async () => {
    if (!result) return;

    const sourceInfo = file
      ? `Input file: ${file.name}`
      : `Input message: ${msg}`;

    const contentLines = [sourceInfo, `MD5 хеш: ${result.hash}`];

    if (typeof result.is_valid !== "undefined") {
      contentLines.push(
        `Check status: ${result.is_valid ? "Match" : "Not match"}`,
      );
    }

    const content = contentLines.join("\n");
    const fileName = `lab2_result_${new Date().getTime()}.txt`;

    if ("showSaveFilePicker" in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [
            { description: "Text File", accept: { "text/plain": [".txt"] } },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
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
          if (!loading) {
            setMsg("");
            setFile(null);
            setResult(null);
          }
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
                disabled={!!msg || loading}
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
                  disabled={!!file || loading}
                />

                <button onClick={handleSubmit} disabled={loading}>
                  Генерувати
                </button>
              </div>
            </div>
          </Card>
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
                disabled={loading}
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
                  disabled={loading}
                />
                <button onClick={handleFileSubmit} disabled={!file || loading}>
                  Обробити файл
                </button>
              </div>
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

      {result && !loading && (
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
            }}
          >
            <Typography.Title
              level={3}
              style={{ margin: 0, wordBreak: "break-all" }}
            >
              {result.hash}
            </Typography.Title>
            <Typography.Text
              type="secondary"
              style={{
                color:
                  typeof result.is_valid !== "undefined"
                    ? result.is_valid
                      ? "#32CD32"
                      : "#FF4D4F"
                    : "inherit",
              }}
            >
              {typeof result.is_valid !== "undefined"
                ? result.is_valid
                  ? "Співпадають"
                  : "Не співпадають"
                : "MD5 хеш"}
            </Typography.Text>
          </Card>
          <div style={{ display: "flex" }}>
            <button onClick={downloadTxt} style={{ flex: 1 }}>
              Завантажити
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
