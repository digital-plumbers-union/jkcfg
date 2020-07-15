#!/usr/bin/env bash

readonly TARGET=$1
readonly PKGS=`bazel query '//apps/... + //lib/...' --output=package`
for pkg in $PKGS; do
  bazelisk run ${pkg}:update_${TARGET}
done
