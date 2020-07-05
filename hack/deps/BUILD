package(default_visibility = ["//visibility:public"])

load("@npm_bazel_typescript//:index.bzl", "ts_library")
load("//hack/deps:deps.bzl", "deps")
load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")

ts_library(
  name = "update",
  srcs = ["update.ts"],
  runtime = "nodejs",
  deps = deps
)

ts_library(
  name = "check",
  srcs = ["check.ts"],
  runtime = "nodejs",
  deps = deps
)