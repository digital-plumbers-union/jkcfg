load("//hack:typescript.bzl", "app")

package(default_visibility = ["//visibility:public"])

app(
    name = "nfs-server",
    srcs = glob(["**/*.ts"]),
    label = "//apps/nfs-server",
    deps = [
        "@npm//@types/lodash-es",
        "@npm//lodash-es",
    ],
)
