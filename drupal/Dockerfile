FROM composer:2 AS composer
FROM drupal:11-apache

COPY --from=composer /usr/bin/composer /usr/local/bin/composer
WORKDIR /opt/drupal
RUN composer require drush/drush:^13 'drupal/openid_connect:^3.0@alpha' --no-interaction --no-progress

COPY manifest.json /opt/owc-drupal/manifest.json
COPY scripts /opt/owc-drupal/scripts
COPY migration /opt/owc-drupal/migration
COPY modules/custom /opt/drupal/web/modules/custom
RUN chmod +x /opt/owc-drupal/scripts/*.sh
