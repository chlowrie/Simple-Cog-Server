FROM perrygeo/gdal-base:latest

RUN cat /etc/issue
RUN echo $NAME
ENV APP_HOME /app
WORKDIR $APP_HOME
COPY cloudfunctions_dev.py requirements.txt ./
COPY <App Creds>
ENV PORT 8000
ENV GOOGLE_APPLICATION_CREDENTIALS=<App Creds>

RUN pip install --no-cache-dir -r requirements.txt


# CMD exec uvicorn --port 8000 cloudfunctions_dev:app --reload
CMD ["uvicorn", "cloudfunctions_dev:app", "--proxy-headers", "--host", "0.0.0.0", "--port", "8000"]