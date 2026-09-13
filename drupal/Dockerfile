FROM composer:2 AS composer
FROM drupal:11-apache

COPY --from=composer /usr/bin/composer /usr/local/bin/composer
WORKDIR /opt/drupal
RUN set -eu; \
    attempt=1; \
    until composer require drush/drush:^13 'drupal/openid_connect:^3.0@alpha' --no-interaction --no-progress; do \
      if [ "$attempt" -ge 3 ]; then \
        echo "Composer dependency installation failed after ${attempt} attempts" >&2; \
        exit 1; \
      fi; \
      echo "Composer dependency installation failed on attempt ${attempt}; retrying" >&2; \
      attempt=$((attempt + 1)); \
      sleep 5; \
    done

COPY manifest.json /opt/owc-drupal/manifest.json
COPY scripts /opt/owc-drupal/scripts
COPY migration /opt/owc-drupal/migration
COPY modules/custom /opt/drupal/web/modules/custom
RUN chmod +x /opt/owc-drupal/scripts/*.sh
