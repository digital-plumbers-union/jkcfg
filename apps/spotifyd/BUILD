load("//hack:typescript.bzl", "app")

package(default_visibility = ["//visibility:public"])

app(
    name = "spotifyd",
    srcs = glob(["**/*.ts"]),
    label = "//apps/spotifyd",
    deps = [
        "@npm//@types/lodash-es",
        "@npm//lodash-es",
    ],
)
