FROM python:latest

WORKDIR /app

ENV PYTHONPATH="/app/pages:/app/utils:${PYTHONPATH}"

# set display port to avoid crash
ENV DISPLAY=:99

COPY ./requirements.txt .

RUN pip install --upgrade pip && pip install -r requirements.txt


COPY ./pages ./pages
COPY ./utils ./utils
COPY ./main.py .


RUN echo "Hostname: $(hostname)"


CMD ["python", "main.py"]