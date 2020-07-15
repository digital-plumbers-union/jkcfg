load("//hack:typescript.bzl", "app")

package(default_visibility = ["//visibility:public"])

app(
    name = "monero-node",
    srcs = glob(["**/*.ts"]),
    label = "//apps/monero-node",
    deps = [
        "@npm//@types/lodash-es",
        "@npm//lodash-es",
    ],
)
