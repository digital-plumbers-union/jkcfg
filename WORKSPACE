workspace(
    name = "dpu_jkcfg",
    # tells bazel that node_modules dir is managed by rules_nodejs
    # see: https://bazelbuild.github.io/rules_nodejs/install.html#using-bazel-managed-dependencies
    managed_directories = {"@npm": ["node_modules"]},
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive", "http_file")

################################################################################
# BAZEL RULE / TOOLCHAIN SETUP
################################################################################

# download `io_bazel_rules_go` up front to ensure all of our other rulesets
# leverage the same version, see related issue:
# https://github.com/bazelbuild/rules_go/issues/2398#issuecomment-597139571
http_archive(
    name = "io_bazel_rules_go",
    sha256 = "7b9bbe3ea1fccb46dcfa6c3f3e29ba7ec740d8733370e21cdc8937467b4a4349",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/rules_go/releases/download/v0.22.4/rules_go-v0.22.4.tar.gz",
        "https://github.com/bazelbuild/rules_go/releases/download/v0.22.4/rules_go-v0.22.4.tar.gz",
    ],
)

# set up `io_bazel_rules_go` imported at top of this file
load("@io_bazel_rules_go//go:deps.bzl", "go_register_toolchains", "go_rules_dependencies")

# gazell generates BUILD files for go/protobuf
http_archive(
    name = "bazel_gazelle",
    sha256 = "d8c45ee70ec39a57e7a05e5027c32b1576cc7f16d9dd37135b0eddde45cf1b10",
    urls = [
        "https://storage.googleapis.com/bazel-mirror/github.com/bazelbuild/bazel-gazelle/releases/download/v0.20.0/bazel-gazelle-v0.20.0.tar.gz",
        "https://github.com/bazelbuild/bazel-gazelle/releases/download/v0.20.0/bazel-gazelle-v0.20.0.tar.gz",
    ],
)

# protobuf
http_archive(
    name = "com_google_protobuf",
    sha256 = "b0a1da830747a2ffc1125fc84dbd3fe32a876396592d4580501749a2d0d0cb15",
    strip_prefix = "protobuf-3.12.2",
    urls = ["https://github.com/protocolbuffers/protobuf/archive/v3.12.2.zip"],
)

load("@com_google_protobuf//:protobuf_deps.bzl", "protobuf_deps")
load("@bazel_gazelle//:deps.bzl", "gazelle_dependencies")

# only set up dependencies once we have imported everything that could
# possibly be overridden: see "overriding dependencies" here:
# https://github.com/bazelbuild/rules_go/blob/master/go/workspace.rst#id9

go_rules_dependencies()

go_register_toolchains()

gazelle_dependencies()

protobuf_deps()

# pull buildtools now that all dependencies are loaded/installed:
# - go
# - gazelle
# - protobuf
http_archive(
    name = "com_github_bazelbuild_buildtools",
    sha256 = "f11fc80da0681a6d64632a850346ed2d4e5cbb0908306d9a2a2915f707048a10",
    strip_prefix = "buildtools-3.3.0",
    url = "https://github.com/bazelbuild/buildtools/archive/3.3.0.tar.gz",
)

#########################################
# NODE/TYPESCRIPT
#########################################

http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "f9e7b9f42ae202cc2d2ce6d698ccb49a9f7f7ea572a78fd451696d03ef2ee116",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/1.6.0/rules_nodejs-1.6.0.tar.gz"],
)

##########################################################
# NODE DEPENDENCIES
##########################################################

# configure rules_nodejs for this workspace
# note: this does not actually install the dependencies, see below
load("@build_bazel_rules_nodejs//:index.bzl", "node_repositories")

node_repositories(package_json = ["//:package.json"])

# set up target which installs the dependencies
# see: https://bazelbuild.github.io/rules_nodejs/install.html#using-bazel-managed-dependencies
load("@build_bazel_rules_nodejs//:index.bzl", "yarn_install")

yarn_install(
    name = "npm",
    package_json = "//:package.json",
    yarn_lock = "//:yarn.lock",
)

# Install any Bazel rules which were extracted earlier by the yarn_install rule.
load("@npm//:install_bazel_dependencies.bzl", "install_bazel_dependencies")

install_bazel_dependencies()

# Setup TypeScript toolchain
load("@npm_bazel_typescript//:index.bzl", "ts_setup_workspace")

ts_setup_workspace()
