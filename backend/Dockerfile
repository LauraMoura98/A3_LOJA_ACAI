FROM python:3.10

WORKDIR /code

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1 

COPY requirements.txt /code/requirements.txt
RUN pip install -r requirements.txt


COPY . /code

EXPOSE 8000

RUN python manage.py migrate

CMD ["gunicorn", "--config", "gunicorn_config.py", "loja_acai.wsgi:application"]

