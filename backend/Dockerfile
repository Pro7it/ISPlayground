FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    g++ \
    build-essential

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN g++ -O3 -shared -std=c++17 -fPIC $(python3 -m pybind11 --includes) app/core/md5.cpp -o app/core/md5$(python3-config --extension-suffix)

RUN g++ -O3 -shared -std=c++17 -fPIC $(python3 -m pybind11 --includes) app/core/rc5.cpp -o app/core/rc5$(python3-config --extension-suffix)

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]