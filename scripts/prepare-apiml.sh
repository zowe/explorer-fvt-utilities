#!/bin/bash -e

################################################################################
# This program and the accompanying materials are made available under the terms of the
# Eclipse Public License v2.0 which accompanies this distribution, and is available at
# https://www.eclipse.org/legal/epl-v20.html
#
# SPDX-License-Identifier: EPL-2.0
#
# Copyright IBM Corporation 2021
################################################################################

################################################################################
# contants
SCRIPT_NAME=$(basename "$0")
DEFAULT_FVT_DISCOVERY_PORT=7553
DEFAULT_FVT_CATALOG_PORT=7552
DEFAULT_FVT_GATEWAY_PORT=7554
DEFAULT_FVT_ML_DEBUG_PROFILES="default"

################################################################################
# variables
FVT_WORKSPACE_DIR=$1
KEYSTORE_DIR=$2
APIML_CONFIGS_DIR=$3
APIML_LOGS_DIR=$4

# allow to override with environment variables
if [ -z "${FVT_DISCOVERY_PORT}" ]; then
  FVT_DISCOVERY_PORT="${DEFAULT_FVT_DISCOVERY_PORT}"
fi
if [ -z "${FVT_CATALOG_PORT}" ]; then
  FVT_CATALOG_PORT="${DEFAULT_FVT_CATALOG_PORT}"
fi
if [ -z "${FVT_GATEWAY_PORT}" ]; then
  FVT_GATEWAY_PORT="${DEFAULT_FVT_GATEWAY_PORT}"
fi
if [ -z "${API_ML_DEBUG_PROFILES}" ]; then
  API_ML_DEBUG_PROFILES="${DEFAULT_FVT_ML_DEBUG_PROFILES}"
fi
# validate
if [ -z "${FVT_WORKSPACE_DIR}" ]; then
  echo "[${SCRIPT_NAME}][Error] parameter #1 (fvt workspace directory) is required" >&2
  exit 1
fi
if [ -z "${KEYSTORE_DIR}" ]; then
  echo "[${SCRIPT_NAME}][Error] parameter #2 (keystore directory) is required" >&2
  exit 1
fi
if [ -z "${APIML_CONFIGS_DIR}" ]; then
  echo "[${SCRIPT_NAME}][Error] parameter #3 (apiml config directory) is required" >&2
  exit 1
fi
if [ -z "${APIML_LOGS_DIR}" ]; then
  echo "[${SCRIPT_NAME}][Error] parameter #4 (apiml logs directory) is required" >&2
  exit 1
fi

cat > "$FVT_WORKSPACE_DIR/docker-compose.yml" << EOF
version: "3.9"
services:
  discovery-service:
    ports:
      - ${FVT_DISCOVERY_PORT}:${FVT_DISCOVERY_PORT}
    volumes:
      - ${APIML_CONFIGS_DIR}:/api-defs
      - ${KEYSTORE_DIR}:/keystore
    environment:
      CMMN_LB: apiml-common-lib/bin/api-layer-lite-lib-all.jar
      ZWE_DISCOVERY_SERVICES_LIST: "https://discovery-service:${FVT_DISCOVERY_PORT}/eureka/"
      WORKSPACE_DIR: "/tmp"
      DISCOVERY_PORT: ${FVT_DISCOVERY_PORT}
      STATIC_DEF_CONFIG_DIR: /api-defs
      KEYSTORE: "/keystore/localhost.keystore.p12"
      KEYSTORE_PASSWORD: password
      KEY_ALIAS: localhost
      TRUSTSTORE: "/keystore/localhost.truststore.p12"
      VERIFY_CERTIFICATES: "false"
      NONSTRICT_VERIFY_CERTIFICATES: "false"
      APIML_DIAG_MODE_ENABLED: ${API_ML_DEBUG_PROFILES}
    image: "zowe-docker-release.jfrog.io/ompzowe/discovery-service:1-ubuntu"

  gateway-service:
    ports:
      - ${FVT_GATEWAY_PORT}:${FVT_GATEWAY_PORT}
    volumes:
      - ${APIML_CONFIGS_DIR}:/api-defs
      - ${KEYSTORE_DIR}:/keystore
    environment:
      CMMN_LB: apiml-common-lib/bin/api-layer-lite-lib-all.jar
      GATEWAY_SERVICE_PORT: ${FVT_GATEWAY_PORT}
      ZWE_DISCOVERY_SERVICES_LIST: "https://discovery-service:${FVT_DISCOVERY_PORT}/eureka/"
      KEYSTORE: "/keystore/localhost.keystore.p12"
      KEYSTORE_PASSWORD: password
      ZOWE_EXPLORER_HOST: gateway-service
      WORKSPACE_DIR: "/tmp"
      KEY_ALIAS: localhost
      TRUSTSTORE: "/keystore/localhost.truststore.p12"
      VERIFY_CERTIFICATES: "false"
      NONSTRICT_VERIFY_CERTIFICATES: "false"
      APIML_DIAG_MODE_ENABLED: ${API_ML_DEBUG_PROFILES}
    image: "zowe-docker-release.jfrog.io/ompzowe/gateway-service:1-ubuntu"
EOF

################################################################################
# echo "[${SCRIPT_NAME}] start APIML API Catalog"
# # -Xquickstart \
# java -Xms16m -Xmx512m \
#     -Dibm.serversocket.recover=true \
#     -Dfile.encoding=UTF-8 \
#     -Djava.io.tmpdir=/tmp \
#     -Denvironment.hostname=localhost \
#     -Denvironment.port=${FVT_CATALOG_PORT} \
#     -Denvironment.discoveryLocations=https://localhost:${FVT_DISCOVERY_PORT}/eureka/ \
#     -Denvironment.ipAddress=127.0.0.1 \
#     -Denvironment.preferIpAddress=true -Denvironment.gatewayHostname=localhost \
#     -Denvironment.eurekaUserId=eureka \
#     -Denvironment.eurekaPassword=password \
#     -Dapiml.security.auth.zosmfServiceId=zosmf \
#     -Dapiml.security.ssl.verifySslCertificatesOfServices=false \
#     -Dspring.profiles.include=debug \
#     -Dserver.address=0.0.0.0 \
#     -Dserver.ssl.enabled=true \
#     -Dserver.ssl.keyStore="${KEYSTORE_DIR}/localhost.keystore.p12" \
#     -Dserver.ssl.keyStoreType=PKCS12 \
#     -Dserver.ssl.keyStorePassword=password \
#     -Dserver.ssl.keyAlias=localhost \
#     -Dserver.ssl.keyPassword=password \
#     -Dserver.ssl.trustStore="${KEYSTORE_DIR}/localhost.truststore.p12" \
#     -Dserver.ssl.trustStoreType=PKCS12 \
#     -Dserver.ssl.trustStorePassword=password \
#     -Djava.protocol.handler.pkgs=com.ibm.crypto.provider \
#     -jar "${APIML_ROOT_DIR}/api-catalog-services.jar" \
#     > "${APIML_LOGS_DIR}/api-catalog-services.log"  &
# echo
