#!/usr/bin/env bash

# the tag you want to release should already have been cut before running
# the release script
echo BUILD_SCM_VERSION $(git describe --abbrev=0 --tags)
