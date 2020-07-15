load("//hack:typescript.bzl", "lib")

package(default_visibility = ["//visibility:public"])

lib(
    name = "jkcfg-k8s",
    srcs = glob(["**/*.ts"]),
    label = "//lib/k8s",
    deps = [
        "@npm//@jkcfg/kubernetes",
        "@npm//@jkcfg/std",
        "@npm//@kubernetes/client-node",
        "@npm//@types/lodash-es",
        "@npm//lodash-es",
    ],
)
