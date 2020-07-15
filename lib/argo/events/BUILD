load("//hack:typescript.bzl", "lib")
load("@npm_bazel_typescript//:index.bzl", "ts_config")

package(default_visibility = ["//visibility:public"])

# TODO: should wrap this in a macro so all generated modules can reuse
ts_config(
    name = "tsconfig",
    src = ":tsconfig.json",
    deps = ["//:tsconfig.json"],
)

lib(
    name = "argo-events",
    srcs = ["index.ts"],
    label = "//lib/argo/events",
    tsconfig = ":tsconfig",
    deps = [
        "//lib/k8s:jkcfg-k8s",
        "@npm//@jkcfg/kubernetes",
    ],
)
