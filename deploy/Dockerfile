FROM nginx

ARG container_version=0.1

LABEL description="Озеленение территорий на картах 2ГИС" \
      version=$container_version \
      maintainer="<Белошицкий Михаил Юрьевич> m.beloshickiy@2gis.ru" \
      source="https://gitlab.2gis.ru/m.beloshickiy/ent"

COPY dist/* /usr/share/nginx/html/
