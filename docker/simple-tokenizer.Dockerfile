FROM --platform=${TARGETPLATFORM:-linux/amd64} debian:bookworm AS init

RUN apt-get update \
  && apt-get install -y build-essential git cmake \
  && git clone https://github.com/wangfenjin/simple.git \
  && cd simple \
  && mkdir build \
  && cmake -DSIMPLE_WITH_JIEBA=OFF . \
  && make -j 12

RUN mv simple/src/libsimple.so /libsimple.so
