load("//hack:typescript.bzl", "app")

package(default_visibility = ["//visibility:public"])

app(
    name = "syncthing",
    srcs = glob(["**/*.ts"]),
    label = "//apps/syncthing",
    deps = [
        "@npm//@types/lodash-es",
        "@npm//lodash-es",
    ],
)
