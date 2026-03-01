import { useState } from "react";
import axios from "axios";
import { Card, Progress, Spin, Typography } from "antd";

interface ILab1 {
  numbers: number[];
  period: number;
  pi_est_my: number | null;
  pi_est_sys: number | null;
}

interface IParams {
  m: number | "";
  a: number | "";
  c: number | "";
  x0: number | "";
}

export default function Lab1() {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState<number | "">("");
  const [result, setResult] = useState<ILab1 | null>(null);
  const [params, setParams] = useState<IParams>({
    m: Math.pow(2, 29) - 1,
    a: Math.pow(16, 3),
    c: 6765,
    x0: 23,
  });

  const handleSubmit = async () => {
    if (
      count === "" ||
      params.m === "" ||
      params.a === "" ||
      params.c === "" ||
      params.x0 === ""
    ) {
      alert("Будь ласка, заповніть усі параметри");
      return;
    }

    if (loading) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("count", count.toString());
    formData.append("m", params.m.toString());
    formData.append("a", params.a.toString());
    formData.append("c", params.c.toString());
    formData.append("x0", params.x0.toString());

    try {
      const response = await axios.post(
        "http://localhost:8000/api/lab1",
        formData,
      );

      setResult(response.data);
    } catch (e) {
      alert("Помилка при генерації випадкових чисел");
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: number | null) =>
    value !== null ? value : "Не обчислено";

  const downloadTxt = async () => {
    if (!result) return;

    // Формуємо вміст БЕЗ відступів на початку рядків
    const content = [
      `=== ПАРАМЕТРИ ГЕНЕРАЦІЇ ===`,
      `Кількість чисел (N): ${count}`,
      `Модуль (m): ${params.m}`,
      `Множник (a): ${params.a}`,
      `Приріст (c): ${params.c}`,
      `Початкове значення (x0): ${params.x0}`,
      ``,
      `=== РЕЗУЛЬТАТИ АНАЛІЗУ ===`,
      `Період: ${result.period === 1000000 ? ">1e6" : result.period}`,
      `Похибка Pi (власна): ${formatValue(result.pi_est_my)}`,
      `Похибка Pi (системна): ${formatValue(result.pi_est_sys)}`,
      ``,
      `=== ЗГЕНЕРОВАНІ ЧИСЛА ===`,
      result.numbers.join("\n"),
    ].join("\n");

    const fileName = `lab1_results_${new Date().getTime()}.txt`;

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
          Лабораторна №1 - ГПВЧ
        </Typography.Title>

        <Typography.Title level={4} style={{ marginTop: 0 }}>
          Теоретичні відомості
        </Typography.Title>

        <Typography.Paragraph>
          Генератор псевдовипадкових чисел - це алгоритм, який створює
          послідовність чисел, що імітує випадковість. Насправді такі числа
          генеруються детермінованим методом на основі початкового значення.
          Період генератора - це довжина послідовності до її повторення. Чим
          більший період, тим якіснішим вважається генератор. Похибка обчислення
          числа pi визначається шляхом статистичного обрахунку взаємнопростих
          чисел і дорівнює 6/pi^2.
        </Typography.Paragraph>
      </Card>
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
            <input
              type="number"
              disabled={loading}
              value={count}
              placeholder="Введіть кількість чисел"
              onChange={(e) => {
                const value = e.target.value;

                if (value === "") {
                  setCount("");
                  return;
                }

                const numericValue = Number(value);

                if (numericValue < 1) {
                  setCount(1);
                } else if (numericValue > 1e6) {
                  setCount(1e6);
                } else {
                  setCount(numericValue);
                }
              }}
              style={{ flex: 1 }}
            />

            <button onClick={handleSubmit} disabled={loading}>
              Генерувати
            </button>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
            }}
          >
            <input
              type="number"
              disabled={loading}
              value={params.m}
              placeholder="Введіть m"
              onChange={(e) => {
                const value = e.target.value;

                if (value === "") {
                  setParams({ ...params, m: "" });
                  return;
                }
                const numericValue = Number(value);

                if (numericValue < 1) {
                  setParams({ ...params, m: 1 });
                } else if (numericValue > 1e9) {
                  setParams({ ...params, m: 1e9 });
                } else {
                  setParams({ ...params, m: numericValue });
                }
              }}
              style={{ flex: 1 }}
            />
            <input
              type="number"
              disabled={loading}
              value={params.a}
              placeholder="Введіть a"
              onChange={(e) => {
                const value = e.target.value;

                if (value === "") {
                  setParams({ ...params, a: "" });
                  return;
                }
                const numericValue = Number(value);

                if (numericValue < 1) {
                  setParams({ ...params, a: 1 });
                } else if (numericValue > 1e9) {
                  setParams({ ...params, a: 1e9 });
                } else {
                  setParams({ ...params, a: numericValue });
                }
              }}
              style={{ flex: 1 }}
            />
            <input
              type="number"
              disabled={loading}
              value={params.c}
              placeholder="Введіть c"
              onChange={(e) => {
                const value = e.target.value;

                if (value === "") {
                  setParams({ ...params, c: "" });
                  return;
                }
                const numericValue = Number(value);

                if (numericValue < 1) {
                  setParams({ ...params, c: 1 });
                } else if (numericValue > 1e9) {
                  setParams({ ...params, c: 1e9 });
                } else {
                  setParams({ ...params, c: numericValue });
                }
              }}
              style={{ flex: 1 }}
            />
            <input
              type="number"
              disabled={loading}
              value={params.x0}
              placeholder="Введіть x0"
              onChange={(e) => {
                const value = e.target.value;

                if (value === "") {
                  setParams({ ...params, x0: "" });
                  return;
                }
                const numericValue = Number(value);

                if (numericValue < 1) {
                  setParams({ ...params, x0: 1 });
                } else if (numericValue > 1e9) {
                  setParams({ ...params, x0: 1e9 });
                } else {
                  setParams({ ...params, x0: numericValue });
                }
              }}
              style={{ flex: 1 }}
            />
          </div>
        </div>
      </Card>
      {loading && (
        <Card>
          <div style={{ display: "flex" }}>
            <Spin size="large" style={{ flex: 1 }} />
          </div>
        </Card>
      )}
      {result && (
        <Card>
          <Typography.Title level={4} style={{ marginTop: 0 }}>
            Результат:
          </Typography.Title>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <Card
              style={{
                textAlign: "center",
                minHeight: 120,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Typography.Title level={3} style={{ margin: 0 }}>
                {result.period == 1e6 ? ">1e6" : result.period}
              </Typography.Title>
              <Typography.Text type="secondary">Період</Typography.Text>
            </Card>

            <Card
              style={{
                textAlign: "center",
                minHeight: 120,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Typography.Title level={3} style={{ margin: 0 }}>
                {formatValue(result.pi_est_my)}
              </Typography.Title>
              <Typography.Text type="secondary">Похибка pi</Typography.Text>
            </Card>

            <Card
              style={{
                textAlign: "center",
                minHeight: 120,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Typography.Title level={3} style={{ margin: 0 }}>
                {formatValue(result.pi_est_sys)}
              </Typography.Title>
              <Typography.Text type="secondary">
                Системна похибка
              </Typography.Text>
            </Card>
          </div>

          <Typography.Paragraph>
            <b>Числа:</b>
          </Typography.Paragraph>

          <pre
            style={{
              maxHeight: "200px",
              overflow: "auto",
            }}
          >
            {result.numbers.join("\n")}
          </pre>
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
