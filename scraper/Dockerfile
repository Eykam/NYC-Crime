FROM python:latest

WORKDIR /app

ENV PYTHONPATH="/app/pages:/app/utils:${PYTHONPATH}"

# set display port to avoid crash
ENV DISPLAY=:99

COPY ./scraper/requirements.txt .

RUN pip install --upgrade pip && pip install -r requirements.txt


COPY ./scraper/pages ./pages
COPY ./scraper/utils ./utils
COPY ./scraper/main.py .


RUN echo "Hostname: $(hostname)"


CMD ["python", "main.py"]