package(default_visibility = ["//visibility:public"])

load("@npm_bazel_typescript//:index.bzl", "ts_library")

ts_library(
    name = "lib",
    srcs = ["index.ts"],
    runtime = "nodejs",
    deps = [
      "@npm//@types/node",
      "@npm//@types/fs-extra",
      "@npm//fs-extra"
    ],
)