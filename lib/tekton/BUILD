load("//hack:typescript.bzl", "lib")

package(default_visibility = ["//visibility:public"])

lib(
    name = "tekton",
    srcs = glob(["**/*.ts"]),
    label = "//lib/tekton",
    deps = [
        "//lib/k8s:jkcfg-k8s",
        "@npm//@jkcfg/kubernetes",
        "@npm//@jkcfg/std",
        "@npm//@types/lodash-es",
        "@npm//lodash-es",
    ],
)
