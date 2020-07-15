load("//hack:typescript.bzl", "app")

package(default_visibility = ["//visibility:public"])

app(
    name = "nfs-client-provisioner",
    srcs = glob(["**/*.ts"]),
    label = "//apps/nfs-client-provisioner",
    deps = [
        "@npm//@types/lodash-es",
        "@npm//lodash-es",
    ],
)
