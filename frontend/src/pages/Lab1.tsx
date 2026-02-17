import { useState } from "react";
import axios from "axios";
import { Typography } from "antd";

interface ILab1Response {
  numbers: number[];
  period: number;
  pi_error_my: number | null;
  pi_error_sys: number | null;
}

export default function Lab1() {
  const [count, setCount] = useState<number>(1);
  const [result, setResult] = useState<ILab1Response | null>(null);

  const handleSubmit = async () => {
    try {
      const response = await axios.post<ILab1Response>(
        "http://localhost:8000/api/lab1",
        {
          count: count,
        },
      );

      setResult(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const formatValue = (value: number | null) =>
    value !== null ? value : "Не обчислено";

  const downloadTxt = () => {
    if (!result) return;

    const content = result.numbers.join(", ");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "numbers.txt");
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Typography.Title level={3}>Лабораторна №1 — ГПВЧ</Typography.Title>

      <input
        type="number"
        value={count}
        onChange={(e) => setCount(Number(e.target.value))}
        min={1}
      />

      <button onClick={handleSubmit}>Спробувати</button>

      {result && (
        <div>
          <Typography.Title level={4}>Результат:</Typography.Title>
          <Typography.Paragraph>
            <b>Період:</b> {result.period}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <b>Похибка π:</b> {formatValue(result.pi_error_my)} (
            <b>системна:</b> {formatValue(result.pi_error_sys)})
          </Typography.Paragraph>
          <Typography.Paragraph>
            <b>Числа:</b>
          </Typography.Paragraph>

          <div style={{ maxHeight: "200px", overflow: "auto" }}>
            {result.numbers.join(", ")}
          </div>

          <button onClick={downloadTxt}>Завантажити у .txt</button>
        </div>
      )}
    </div>
  );
}
